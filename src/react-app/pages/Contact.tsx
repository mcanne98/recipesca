import { useState, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FormState = "idle" | "loading" | "success" | "error";

// ---------------------------------------------------------------------------
// Shared UI atoms
// ---------------------------------------------------------------------------
function Field({
	id, label, type = "text", placeholder, required, value, onChange, disabled,
}: {
	id: string; label: string; type?: string; placeholder: string;
	required?: boolean; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
	return (
		<div>
			<label htmlFor={id} className="block text-sm font-semibold text-[#1f2937] mb-1.5">
				{label} {required && <span className="text-[#e07030]">*</span>}
			</label>
			<input
				id={id}
				type={type}
				required={required}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
					focus:outline-none focus:border-[#e07030] focus:ring-2 focus:ring-[#e07030]/20
					disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			/>
		</div>
	);
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
	return (
		<button
			type="submit"
			disabled={loading}
			className="w-full bg-[#e07030] hover:bg-[#c05a20] disabled:opacity-60 disabled:cursor-not-allowed
				text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
		>
			{loading ? (
				<>
					<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
					</svg>
					{loadingLabel}
				</>
			) : label}
		</button>
	);
}

function ErrorBanner({ message }: { message: string }) {
	return (
		<div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
			<span className="mt-0.5 flex-shrink-0">⚠️</span>
			<span>{message}</span>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Subscribe form
// ---------------------------------------------------------------------------
function SubscribeForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [state, setState] = useState<FormState>("idle");
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setState("loading");
		setError("");

		try {
			const res = await fetch("/api/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim(), email: email.trim() }),
			});
			const data = await res.json() as { success?: boolean; error?: string };
			if (!res.ok || data.error) {
				throw new Error(data.error ?? "Something went wrong. Please try again.");
			}
			setState("success");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setState("error");
		}
	}

	if (state === "success") {
		return (
			<div className="text-center py-6">
				<div className="text-5xl mb-4">🎉</div>
				<h3 className="text-xl font-black text-[#1f2937] mb-2">You're in, {name.split(" ")[0]}!</h3>
				<p className="text-gray-500 text-sm">
					Check your inbox — a confirmation is on its way. The next meal plan lands Monday.
				</p>
			</div>
		);
	}

	const loading = state === "loading";

	return (
		<form onSubmit={handleSubmit} className="space-y-4" noValidate>
			<Field id="sub-name" label="First name" placeholder="Your first name" required value={name} onChange={setName} disabled={loading} />
			<Field id="sub-email" label="Email address" type="email" placeholder="you@example.com" required value={email} onChange={setEmail} disabled={loading} />
			{error && <ErrorBanner message={error} />}
			<SubmitButton loading={loading} label="Subscribe — it's free" loadingLabel="Subscribing…" />
			<p className="text-xs text-gray-400 text-center">No spam. Unsubscribe anytime.</p>
		</form>
	);
}

// ---------------------------------------------------------------------------
// Contact / Message form
// ---------------------------------------------------------------------------
function ContactForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [state, setState] = useState<FormState>("idle");
	const [error, setError] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setState("loading");
		setError("");

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
			});
			const data = await res.json() as { success?: boolean; error?: string };
			if (!res.ok || data.error) {
				throw new Error(data.error ?? "Something went wrong. Please try again.");
			}
			setState("success");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setState("error");
		}
	}

	if (state === "success") {
		return (
			<div className="text-center py-6">
				<div className="text-5xl mb-4">✉️</div>
				<h3 className="text-xl font-black text-[#1f2937] mb-2">Message received!</h3>
				<p className="text-gray-500 text-sm">
					Thanks {name.split(" ")[0]} — I read every message and try to reply within a day or two.
				</p>
			</div>
		);
	}

	const loading = state === "loading";

	return (
		<form onSubmit={handleSubmit} className="space-y-4" noValidate>
			<Field id="msg-name" label="Name" placeholder="Your name" required value={name} onChange={setName} disabled={loading} />
			<Field id="msg-email" label="Email" type="email" placeholder="you@example.com" required value={email} onChange={setEmail} disabled={loading} />
			<div>
				<label htmlFor="msg-message" className="block text-sm font-semibold text-[#1f2937] mb-1.5">
					Message <span className="text-[#e07030]">*</span>
				</label>
				<textarea
					id="msg-message"
					ref={textareaRef}
					required
					rows={5}
					placeholder="Recipe suggestion? Something that worked for your family? Just want to say hi?"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					disabled={loading}
					className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
						focus:outline-none focus:border-[#e07030] focus:ring-2 focus:ring-[#e07030]/20
						disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				/>
				<p className="text-xs text-gray-400 mt-1">{message.length} / 1000 chars</p>
			</div>
			{error && <ErrorBanner message={error} />}
			<SubmitButton loading={loading} label="Send message" loadingLabel="Sending…" />
		</form>
	);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Contact() {
	return (
		<>
			{/* Header */}
			<section className="bg-[#1f2937] text-white py-16 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-2">Stay Connected</p>
					<h1 className="text-4xl md:text-5xl font-black mb-4">Get in Touch</h1>
					<p className="text-gray-300 text-lg max-w-xl mx-auto">
						Subscribe for weekly meal plans, or send me a message directly. I read everything.
					</p>
				</div>
			</section>

			<div className="bg-[#faf8f4] min-h-screen">
				<div className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-start">

					{/* ── Subscribe card ─────────────────────────── */}
					<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
						{/* Card header */}
						<div className="bg-gradient-to-br from-[#e07030] to-[#f5a060] px-8 py-8 text-white">
							<div className="text-4xl mb-3">📬</div>
							<h2 className="text-2xl font-black mb-1">Free Recipe Club</h2>
							<p className="text-orange-100 text-sm leading-relaxed">
								A new weekly meal plan every Monday — shopping list, batch prep schedule, and recipe cards included.
							</p>
						</div>
						{/* Perks list */}
						<div className="px-8 py-5 border-b border-gray-100">
							<ul className="space-y-2.5 text-sm text-gray-600">
								{[
									"Full 7-day meal plan every week",
									"Shopping list grouped by category",
									"3–4 hour batch prep schedule",
									"Recipe cards for every meal",
									"Kid-friendly tips & substitutions",
								].map((perk) => (
									<li key={perk} className="flex items-center gap-2.5">
										<span className="text-[#7a9e7e] font-bold flex-shrink-0">✓</span>
										{perk}
									</li>
								))}
							</ul>
						</div>
						{/* Form */}
						<div className="px-8 py-6">
							<SubscribeForm />
						</div>
					</div>

					{/* ── Contact card ───────────────────────────── */}
					<div className="space-y-6">
						<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
							{/* Card header */}
							<div className="bg-gradient-to-br from-[#1f2937] to-[#374151] px-8 py-8 text-white">
								<div className="text-4xl mb-3">💬</div>
								<h2 className="text-2xl font-black mb-1">Send a Message</h2>
								<p className="text-gray-400 text-sm leading-relaxed">
									Recipe suggestion? Something that worked well for your family? Just say hi.
								</p>
							</div>
							{/* Form */}
							<div className="px-8 py-6">
								<ContactForm />
							</div>
						</div>

						{/* Quick info card */}
						<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
							<h3 className="font-black text-[#1f2937]">What I typically respond to</h3>
							<div className="space-y-3">
								{[
									{ icon: "🍗", text: "Recipe requests or substitution ideas" },
									{ icon: "📋", text: "Feedback on a meal plan you tried" },
									{ icon: "👨‍👧‍👦", text: "Stories about your own parenting-week cooking" },
									{ icon: "🤝", text: "Collaborations or media enquiries" },
								].map((item) => (
									<div key={item.text} className="flex items-start gap-3 text-sm text-gray-600">
										<span className="text-lg flex-shrink-0">{item.icon}</span>
										<span>{item.text}</span>
									</div>
								))}
							</div>
						</div>
					</div>

				</div>
			</div>
		</>
	);
}
