import { Hono } from "hono";
import { cors } from "hono/cors";

// ---------------------------------------------------------------------------
// Env — KV + secrets
// Setup steps:
//   1. wrangler kv namespace create WOWOK_DATA   (copy the id into wrangler.json)
//   2. wrangler secret put RESEND_API_KEY         (get key at resend.com — free tier)
//   3. Set NOTIFICATION_EMAIL in wrangler.json vars
//   4. Set SUMMARY_EMAIL in wrangler.json vars (receives post-blast summary)
// ---------------------------------------------------------------------------
interface AppEnv {
	WOWOK_DATA: KVNamespace;
	RESEND_API_KEY?: string;
	/** Where owner notifications are sent (new subscriber, contact form). */
	NOTIFICATION_EMAIL?: string;
	/** Where the post-blast summary is sent (list of who received the newsletter). */
	SUMMARY_EMAIL?: string;
	/**
	 * The "from" address for outgoing email.
	 * ─ Before domain verification: leave unset → falls back to "onboarding@resend.dev"
	 * ─ After verifying cedricanne.com in Resend dashboard:
	 *   set to "Week On Week Off Kitchen <hello@cedricanne.com>"
	 */
	FROM_EMAIL?: string;
}

interface Subscriber {
	name: string;
	email: string;
	unsubscribeToken: string;
	subscribedAt: string;
}

const SITE_URL = "https://weekonweekoff.cedricanne.com";
const SITE_NAME = "Week On Week Off Kitchen";

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

	// Check for duplicate
	try {
		const existing = await c.env.WOWOK_DATA.get(`subscriber:${email}`);
		if (existing) {
			return c.json({ error: "You're already subscribed!" }, 409);
		}
	} catch { /* KV not configured in dev */ }

	// Generate unsubscribe token
	const unsubscribeToken = crypto.randomUUID();

	// Persist to KV
	const subscriber: Subscriber = {
		name,
		email,
		unsubscribeToken,
		subscribedAt: new Date().toISOString(),
	};
	try {
		const ttl = 60 * 60 * 24 * 365 * 5;
		await Promise.all([
			c.env.WOWOK_DATA.put(`subscriber:${email}`, JSON.stringify(subscriber), { expirationTtl: ttl }),
			// Reverse lookup: token → email (for unsubscribe)
			c.env.WOWOK_DATA.put(`token:${unsubscribeToken}`, email, { expirationTtl: ttl }),
		]);
	} catch {
		console.warn("KV not configured — subscription not persisted.");
	}

	// Send emails via Resend
	if (c.env.RESEND_API_KEY) {
		const from = c.env.FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`;
		const unsubUrl = `${SITE_URL}/#/unsubscribe?token=${unsubscribeToken}`;
		await Promise.allSettled([
			// Notification to site owner
			sendEmail({
				apiKey: c.env.RESEND_API_KEY,
				from,
				to: c.env.NOTIFICATION_EMAIL ?? "you@example.com",
				subject: `🍳 New subscriber: ${name}`,
				html: `
					<h2>New subscriber on ${SITE_NAME}</h2>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
				`,
			}),
			// Welcome email to subscriber
			sendEmail({
				apiKey: c.env.RESEND_API_KEY,
				from,
				to: email,
				subject: `You're in! 🍳 ${SITE_NAME}`,
				html: buildWelcomeEmail(name, unsubUrl),
			}),
		]);
	}

	return c.json({ success: true, message: "You're subscribed! Check your inbox." });
});

// ---------------------------------------------------------------------------
// GET /api/unsubscribe?token=xxx
// Removes a subscriber using their unsubscribe token
// ---------------------------------------------------------------------------
app.get("/api/unsubscribe", async (c) => {
	const token = c.req.query("token");
	if (!token) {
		return c.html(unsubscribePage("Invalid link", "This unsubscribe link is missing a token. Please contact us if you need help.", false), 400);
	}

	try {
		const email = await c.env.WOWOK_DATA.get(`token:${token}`);
		if (!email) {
			return c.html(unsubscribePage("Already unsubscribed", "You're not on the list, or you've already unsubscribed. No further action needed.", false), 200);
		}
		await Promise.all([
			c.env.WOWOK_DATA.delete(`subscriber:${email}`),
			c.env.WOWOK_DATA.delete(`token:${token}`),
		]);
		return c.html(unsubscribePage("Unsubscribed", "You've been removed from the list. You won't receive any more emails from us.", true), 200);
	} catch (err) {
		console.error("Unsubscribe error:", err);
		return c.html(unsubscribePage("Error", "Something went wrong. Please try again later.", false), 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/send-newsletter
// Body: { planTitle: string, planUrl: string, planDescription: string, heroImage?: string }
// Auth: Authorization: Bearer <RESEND_API_KEY>
// Sends the newsletter to all KV subscribers, then emails a delivery summary
// to SUMMARY_EMAIL.
// ---------------------------------------------------------------------------
app.post("/api/send-newsletter", async (c) => {
	// Auth check
	const auth = c.req.header("Authorization");
	if (!c.env.RESEND_API_KEY || auth !== `Bearer ${c.env.RESEND_API_KEY}`) {
		return c.json({ error: "Unauthorized." }, 401);
	}

	let body: { planTitle?: string; planUrl?: string; planDescription?: string; heroImage?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	const { planTitle, planUrl, planDescription, heroImage } = body;
	if (!planTitle || !planUrl || !planDescription) {
		return c.json({ error: "planTitle, planUrl, and planDescription are required." }, 400);
	}

	// List all subscribers from KV
	const subscribers: Subscriber[] = [];
	let cursor: string | undefined;
	do {
		const page = await c.env.WOWOK_DATA.list({ prefix: "subscriber:", cursor });
		for (const key of page.keys) {
			const raw = await c.env.WOWOK_DATA.get(key.name);
			if (raw) {
				try { subscribers.push(JSON.parse(raw) as Subscriber); } catch { /* skip */ }
			}
		}
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);

	if (!subscribers.length) {
		return c.json({ ok: true, sent: 0, failed: 0, message: "No subscribers." });
	}

	const from = c.env.FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`;
	const sent: string[] = [];
	const failed: string[] = [];

	for (const sub of subscribers) {
		const unsubUrl = `${SITE_URL}/#/unsubscribe?token=${sub.unsubscribeToken}`;
		try {
			await sendEmail({
				apiKey: c.env.RESEND_API_KEY,
				from,
				to: sub.email,
				subject: `🍽️ New meal plan: ${planTitle}`,
				html: buildNewsletterEmail(sub.name, planTitle, planUrl, planDescription, heroImage, unsubUrl),
			});
			sent.push(`${sub.name} <${sub.email}>`);
		} catch (err) {
			console.error(`Failed to send to ${sub.email}:`, err);
			failed.push(`${sub.name} <${sub.email}>`);
		}
		// Stay within Resend rate limits
		await new Promise((r) => setTimeout(r, 120));
	}

	// Send delivery summary to owner
	const summaryTo = c.env.SUMMARY_EMAIL ?? c.env.NOTIFICATION_EMAIL ?? "you@example.com";
	const summaryHtml = buildSummaryEmail(planTitle, sent, failed);
	await sendEmail({
		apiKey: c.env.RESEND_API_KEY,
		from,
		to: summaryTo,
		subject: `📊 Newsletter sent: ${planTitle} — ${sent.length} delivered, ${failed.length} failed`,
		html: summaryHtml,
	}).catch((err) => console.error("Summary email failed:", err));

	return c.json({ ok: true, sent: sent.length, failed: failed.length });
});

// ---------------------------------------------------------------------------
// GET /api/likes?type=recipe|plan&id=<id>&fp=<fingerprint>
// Returns { count, liked } for a given item + visitor fingerprint
// ---------------------------------------------------------------------------
app.get("/api/likes", async (c) => {
	const type = c.req.query("type");
	const id = c.req.query("id");
	const fp = c.req.query("fp") ?? "";

	if (!type || !id || (type !== "recipe" && type !== "plan")) {
		return c.json({ error: "type (recipe|plan) and id are required." }, 400);
	}

	try {
		const countKey = `likes:${type}:${id}`;
		const dedupKey = `liked:${fp}:${type}:${id}`;
		const [countRaw, likedRaw] = await Promise.all([
			c.env.WOWOK_DATA.get(countKey),
			fp ? c.env.WOWOK_DATA.get(dedupKey) : Promise.resolve(null),
		]);
		return c.json({ count: countRaw ? parseInt(countRaw, 10) : 0, liked: likedRaw === "1" });
	} catch {
		return c.json({ count: 0, liked: false });
	}
});

// ---------------------------------------------------------------------------
// POST /api/like
// Body: { type: "recipe"|"plan", id: string, fp: string }
// fp = browser-generated fingerprint for dedup (stored in localStorage)
// ---------------------------------------------------------------------------
app.post("/api/like", async (c) => {
	let body: { type?: string; id?: string; fp?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	const { type, id, fp } = body;
	if (!type || !id || (type !== "recipe" && type !== "plan")) {
		return c.json({ error: "type (recipe|plan) and id are required." }, 400);
	}
	if (!fp) {
		return c.json({ error: "fp (fingerprint) is required." }, 400);
	}

	const countKey = `likes:${type}:${id}`;
	const dedupKey = `liked:${fp}:${type}:${id}`;
	const ttl = 60 * 60 * 24 * 365 * 10;

	try {
		const alreadyLiked = await c.env.WOWOK_DATA.get(dedupKey);
		if (alreadyLiked) {
			const count = parseInt((await c.env.WOWOK_DATA.get(countKey)) ?? "0", 10);
			return c.json({ count, liked: true, duplicate: true });
		}

		const current = parseInt((await c.env.WOWOK_DATA.get(countKey)) ?? "0", 10);
		const newCount = current + 1;
		await Promise.all([
			c.env.WOWOK_DATA.put(countKey, String(newCount), { expirationTtl: ttl }),
			c.env.WOWOK_DATA.put(dedupKey, "1", { expirationTtl: ttl }),
		]);
		return c.json({ count: newCount, liked: true });
	} catch {
		return c.json({ error: "KV unavailable." }, 503);
	}
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
	try {
		await c.env.WOWOK_DATA.put(
			`message:${id}`,
			JSON.stringify({ id, name, email, message, sentAt: new Date().toISOString() }),
			{ expirationTtl: 60 * 60 * 24 * 365 * 2 }
		);
	} catch {
		console.warn("KV not configured — message not persisted.");
	}

	if (c.env.RESEND_API_KEY) {
		await sendEmail({
			apiKey: c.env.RESEND_API_KEY,
			from: c.env.FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`,
			to: c.env.NOTIFICATION_EMAIL ?? "you@example.com",
			subject: `💬 New message from ${name}`,
			replyTo: email,
			html: `
				<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
					<h2 style="color:#e07030">New message — ${SITE_NAME}</h2>
					<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
					<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
					<div style="margin-top:16px;padding:20px;background:#faf8f4;border-left:4px solid #e07030;border-radius:4px">
						<p style="margin:0;white-space:pre-wrap">${escHtml(message)}</p>
					</div>
					<p style="margin-top:24px;font-size:12px;color:#6b7280">Hit reply to respond directly to ${name}.</p>
				</div>
			`,
		}).catch((err) => console.error("Email notification failed:", err));
	}

	return c.json({ success: true, message: "Message received! I'll be in touch soon." });
});

// ---------------------------------------------------------------------------
// POST /api/share-list
// ---------------------------------------------------------------------------
app.post("/api/share-list", async (c) => {
	let body: {
		to?: string;
		planTitle?: string;
		multiplier?: number;
		sections?: { category: string; items: string[] }[];
	};
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid JSON body." }, 400);
	}

	const to = (body.to ?? "").trim().toLowerCase();
	const planTitle = (body.planTitle ?? "").trim();
	const multiplier = body.multiplier ?? 1;
	const sections = body.sections ?? [];

	if (!to) return c.json({ error: "Email address is required." }, 400);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
		return c.json({ error: "Please enter a valid email address." }, 400);
	}
	if (!sections.length) return c.json({ error: "No items to share." }, 400);

	const multiplierLabel = multiplier === 1 ? "" : ` (${multiplier}× portions)`;
	const sectionsHtml = sections
		.map(
			(s) => `
			<div style="margin-bottom:20px">
				<h3 style="margin:0 0 8px;color:#e07030;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">${escHtml(s.category)}</h3>
				<ul style="margin:0;padding-left:20px">
					${s.items.map((item) => `<li style="margin-bottom:4px;color:#374151">${escHtml(item)}</li>`).join("")}
				</ul>
			</div>`
		)
		.join("");

	if (c.env.RESEND_API_KEY) {
		await sendEmail({
			apiKey: c.env.RESEND_API_KEY,
			from: c.env.FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`,
			to,
			subject: `🛒 Shopping list: ${planTitle}${multiplierLabel}`,
			html: `
				<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
					<h1 style="color:#e07030;margin-bottom:4px">Shopping List</h1>
					<p style="color:#6b7280;margin-top:0;margin-bottom:28px">${escHtml(planTitle)}${multiplierLabel} — from <strong>${SITE_NAME}</strong></p>
					${sectionsHtml}
					<p style="margin-top:32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px">
						Sent from <a href="${SITE_URL}" style="color:#e07030">${SITE_URL}</a>
					</p>
				</div>
			`,
		}).catch((err) => {
			console.error("Share list email failed:", err);
		});
	} else {
		console.log("Share list (no Resend key)");
	}

	return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Email HTML builders
// ---------------------------------------------------------------------------

function buildWelcomeEmail(name: string, unsubUrl: string): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f4;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:#1f2937;padding:20px 28px;border-radius:12px 12px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${SITE_NAME}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#e07030;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;">Weekly Meal Plans · Real Family Food</p>
        </td>
        <td align="right"><a href="${SITE_URL}" style="font-size:11px;color:#9ca3af;text-decoration:none;">weekonweekoff.cedricanne.com</a></td>
      </tr></table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#ffffff;padding:40px 36px 32px;">
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#1f2937;font-weight:700;">Welcome, ${escHtml(name)}! 🎉</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#4b5563;">You're now subscribed to <strong>${SITE_NAME}</strong>.</p>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#4b5563;">Every week you'll get a new meal plan — complete with a shopping list, batch prep schedule, and recipe cards. No fluff, just food.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background:#e07030;border-radius:8px;">
          <a href="${SITE_URL}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Browse meal plans →</a>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="background:#ffffff;padding:0 36px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

  <!-- Footer -->
  <tr>
    <td style="background:#ffffff;padding:20px 36px 28px;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6;">
        You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#e07030;text-decoration:none;">${SITE_URL}</a>.
      </p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:none;">Visit the site</a>
      </p>
    </td>
  </tr>
  <tr><td style="height:24px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildNewsletterEmail(
	name: string,
	planTitle: string,
	planUrl: string,
	planDescription: string,
	heroImage: string | undefined,
	unsubUrl: string
): string {
	const heroTag = heroImage
		? `<tr><td style="background:#1f2937;"><img src="${heroImage}" alt="${escHtml(planTitle)}" width="560" style="width:100%;max-width:560px;height:auto;display:block;"></td></tr>`
		: "";

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(planTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;color:#faf8f4;">${escHtml(planDescription)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f4;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:#1f2937;padding:20px 28px;border-radius:12px 12px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${SITE_NAME}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#e07030;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;">Weekly Meal Plans · Real Family Food</p>
        </td>
        <td align="right"><a href="${SITE_URL}" style="font-size:11px;color:#9ca3af;text-decoration:none;">weekonweekoff.cedricanne.com</a></td>
      </tr></table>
    </td>
  </tr>

  <!-- Hero image -->
  ${heroTag}

  <!-- Body -->
  <tr>
    <td style="background:#ffffff;padding:36px 36px 28px;">
      <p style="margin:0 0 8px;font-size:13px;color:#e07030;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">New this week</p>
      <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#1f2937;font-weight:700;letter-spacing:-0.02em;">${escHtml(planTitle)}</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.75;color:#4b5563;">Hi ${escHtml(name)},</p>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#4b5563;">${escHtml(planDescription)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background:#e07030;border-radius:8px;">
          <a href="${planUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">See the full plan →</a>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="background:#ffffff;padding:0 36px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

  <!-- Footer -->
  <tr>
    <td style="background:#ffffff;padding:20px 36px 28px;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6;">
        You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#e07030;text-decoration:none;">${SITE_URL}</a>.
      </p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:none;">Visit the site</a>
      </p>
    </td>
  </tr>
  <tr><td style="height:24px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildSummaryEmail(planTitle: string, sent: string[], failed: string[]): string {
	const sentRows = sent.map((s) => `<tr><td style="padding:6px 0;font-size:13px;color:#1f2937;border-bottom:1px solid #f3f4f6;">✅ ${escHtml(s)}</td></tr>`).join("");
	const failedRows = failed.map((s) => `<tr><td style="padding:6px 0;font-size:13px;color:#dc2626;border-bottom:1px solid #f3f4f6;">❌ ${escHtml(s)}</td></tr>`).join("");

	return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Newsletter Delivery Summary</title></head>
<body style="margin:0;padding:32px 16px;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;">
  <div style="background:#1f2937;padding:20px 28px;border-radius:12px 12px 0 0;">
    <p style="margin:0;font-size:15px;font-weight:600;color:#fff;">${SITE_NAME}</p>
    <p style="margin:4px 0 0;font-size:11px;color:#e07030;text-transform:uppercase;letter-spacing:0.04em;">Newsletter Delivery Summary</p>
  </div>
  <div style="background:#fff;padding:36px;border-radius:0 0 12px 12px;">
    <h1 style="margin:0 0 8px;font-size:22px;color:#1f2937;">📊 ${escHtml(planTitle)}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;">Sent on ${new Date().toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" })}</p>

    <div style="display:flex;gap:16px;margin-bottom:28px;">
      <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${sent.length}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Delivered</p>
      </div>
      <div style="flex:1;background:${failed.length ? "#fef2f2" : "#f9fafb"};border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:${failed.length ? "#dc2626" : "#9ca3af"};">${failed.length}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Failed</p>
      </div>
    </div>

    ${sent.length ? `
    <h2 style="font-size:14px;font-weight:600;color:#1f2937;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Delivered to</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">${sentRows}</table>
    ` : ""}

    ${failed.length ? `
    <h2 style="font-size:14px;font-weight:600;color:#dc2626;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Failed</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${failedRows}</table>
    ` : ""}
  </div>
</div>
</body>
</html>`;
}

function unsubscribePage(title: string, message: string, success: boolean): string {
	const color = success ? "#e07030" : "#9ca3af";
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)} — ${SITE_NAME}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1f2937; color: #fff; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .box { max-width: 440px; text-align: center; padding: 2rem; }
  .icon { font-size: 2.5rem; margin-bottom: 1.25rem; }
  h1 { font-size: 1.6rem; margin: 0 0 0.75rem; color: ${color}; }
  p { color: #9ca3af; line-height: 1.7; font-size: 0.95rem; margin: 0 0 1.5rem; }
  a { color: #e07030; text-decoration: none; font-size: 0.875rem; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="box">
  <div class="icon">${success ? "✓" : "○"}</div>
  <h1>${escHtml(title)}</h1>
  <p>${escHtml(message)}</p>
  <a href="${SITE_URL}">← Back to ${SITE_NAME}</a>
</div>
</body>
</html>`;
}

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

function escHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export default app;
