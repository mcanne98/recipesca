import { Hono } from "hono";
import { cors } from "hono/cors";

// ---------------------------------------------------------------------------
// Env — KV + secrets
// Setup steps:
//   1. wrangler kv namespace create WOWOK_DATA   (copy the id into wrangler.json)
//   2. wrangler secret put RESEND_API_KEY         (get key at resend.com — free tier)
//   3. Set NOTIFICATION_EMAIL in wrangler.json vars
// ---------------------------------------------------------------------------
interface AppEnv {
	WOWOK_DATA: KVNamespace;
	RESEND_API_KEY?: string;
	/** Where owner notifications are sent. Must be the Resend account email until a domain is verified. */
	NOTIFICATION_EMAIL?: string;
	/**
	 * The "from" address for outgoing email.
	 * ─ Before domain verification: leave unset → falls back to "onboarding@resend.dev"
	 *   (only delivers to the Resend account owner's email)
	 * ─ After verifying cedricanne.com in Resend dashboard:
	 *   set to "Week On Week Off Kitchen <hello@cedricanne.com>"
	 *   then NOTIFICATION_EMAIL can be any address (e.g. ourlittlejar@gmail.com)
	 */
	FROM_EMAIL?: string;
}

const app = new Hono<{ Bindings: AppEnv }>();

// Allow cross-origin in local dev (Vite :5173 → Worker :8787)
app.use("/api/*", cors({ origin: "*" }));

// Keep the original health route
app.get("/api/", (c) => c.json({ name: "Week On Week Off Kitchen API" }));

// ---------------------------------------------------------------------------
// POST /api/subscribe
// Body: { name: string, email: string }
// ---------------------------------------------------------------------------
app.post("/api/subscribe", async (c) => {
	let body: { name?: string; email?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	const name = (body.name ?? "").trim();
	const email = (body.email ?? "").trim().toLowerCase();

	if (!name || !email) {
		return c.json({ error: "Name and email are required." }, 400);
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ error: "Please enter a valid email address." }, 400);
	}

	// Persist to KV (graceful if not configured)
	try {
		await c.env.WOWOK_DATA.put(
			`subscriber:${email}`,
			JSON.stringify({ name, email, subscribedAt: new Date().toISOString() }),
			{ expirationTtl: 60 * 60 * 24 * 365 * 5 }
		);
	} catch {
		console.warn("KV not configured — subscription not persisted.");
	}

	// Send emails via Resend (graceful if key not set)
	if (c.env.RESEND_API_KEY) {
		await Promise.allSettled([
			// Notification to site owner
			sendEmail({
				apiKey: c.env.RESEND_API_KEY,
				from: c.env.FROM_EMAIL ?? "Week On Week Off Kitchen <onboarding@resend.dev>",
				to: c.env.NOTIFICATION_EMAIL ?? "you@example.com",
				subject: `🍳 New subscriber: ${name}`,
				html: `
					<h2>New subscriber on Week On Week Off Kitchen</h2>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
				`,
			}),
			// Confirmation to subscriber
			sendEmail({
				apiKey: c.env.RESEND_API_KEY,
				from: c.env.FROM_EMAIL ?? "Week On Week Off Kitchen <onboarding@resend.dev>",
				to: email,
				subject: "You're in! 🍳 Week On Week Off Kitchen",
				html: `
					<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
						<h1 style="color:#e07030">Welcome, ${name}! 🎉</h1>
						<p>You're now subscribed to <strong>Week On Week Off Kitchen</strong>.</p>
						<p>Every Monday you'll get a new weekly meal plan — complete with a shopping list,
						batch prep schedule, and recipe cards. No fluff, just food.</p>
						<blockquote style="margin:32px 0;padding:20px;background:#faf8f4;
							border-left:4px solid #e07030;border-radius:4px;font-style:italic">
							"One week. Three kids. Real food."
						</blockquote>
						<p>See you Monday,<br/><strong>Week On Week Off Kitchen</strong></p>
					</div>
				`,
			}),
		]);
	}

	return c.json({ success: true, message: "You're subscribed! Check your inbox." });
});

// ---------------------------------------------------------------------------
// POST /api/contact
// Body: { name: string, email: string, message: string }
// ---------------------------------------------------------------------------
app.post("/api/contact", async (c) => {
	let body: { name?: string; email?: string; message?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	const name = (body.name ?? "").trim();
	const email = (body.email ?? "").trim().toLowerCase();
	const message = (body.message ?? "").trim();

	if (!name || !email || !message) {
		return c.json({ error: "All fields are required." }, 400);
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ error: "Please enter a valid email address." }, 400);
	}
	if (message.length < 10) {
		return c.json({ error: "Message is too short — tell me more!" }, 400);
	}

	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

	// Persist to KV
	try {
		await c.env.WOWOK_DATA.put(
			`message:${id}`,
			JSON.stringify({ id, name, email, message, sentAt: new Date().toISOString() }),
			{ expirationTtl: 60 * 60 * 24 * 365 * 2 }
		);
	} catch {
		console.warn("KV not configured — message not persisted.");
	}

	// Notify site owner
	if (c.env.RESEND_API_KEY) {
		await sendEmail({
			apiKey: c.env.RESEND_API_KEY,
			from: c.env.FROM_EMAIL ?? "Week On Week Off Kitchen <onboarding@resend.dev>",
			to: c.env.NOTIFICATION_EMAIL ?? "you@example.com",
			subject: `💬 New message from ${name}`,
			replyTo: email,
			html: `
				<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
					<h2 style="color:#e07030">New message — Week On Week Off Kitchen</h2>
					<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
					<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
					<div style="margin-top:16px;padding:20px;background:#faf8f4;
						border-left:4px solid #e07030;border-radius:4px">
						<p style="margin:0;white-space:pre-wrap">${message}</p>
					</div>
					<p style="margin-top:24px;font-size:12px;color:#6b7280">
						Hit reply to respond directly to ${name}.
					</p>
				</div>
			`,
		}).catch((err) => console.error("Email notification failed:", err));
	}

	return c.json({ success: true, message: "Message received! I'll be in touch soon." });
});

// ---------------------------------------------------------------------------
// Resend helper
// ---------------------------------------------------------------------------
async function sendEmail({
	apiKey,
	from,
	to,
	subject,
	html,
	replyTo,
}: {
	apiKey: string;
	from: string;
	to: string;
	subject: string;
	html: string;
	replyTo?: string;
}) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to,
			subject,
			html,
			...(replyTo ? { reply_to: replyTo } : {}),
		}),
	});

	if (!res.ok) {
		throw new Error(`Resend ${res.status}: ${await res.text()}`);
	}
	return res.json();
}

export default app;
