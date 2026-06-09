import { useState } from "react";

export default function Contact() {
	const [subscribed, setSubscribed] = useState(false);

	return (
		<>
			<section className="bg-[#1f2937] text-white py-20 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">Stay Connected</h1>
					<p className="text-gray-300 text-xl">
						Get new meal plans delivered to your inbox every Monday.
					</p>
				</div>
			</section>

			<div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
				{/* Subscribe form */}
				<section className="bg-white rounded-2xl border border-gray-100 p-8">
					<h2 className="text-2xl font-bold text-[#1f2937] mb-2">Subscribe for new plans</h2>
					<p className="text-gray-500 text-sm mb-6">
						A new weekly meal plan every Monday. No spam, no newsletter fluff — just the plan, the list, and the schedule.
					</p>
					{subscribed ? (
						<div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
							<p className="text-green-700 font-semibold text-lg">You're in! 🎉</p>
							<p className="text-gray-600 text-sm mt-1">
								Watch for next Monday's plan in your inbox.
							</p>
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								setSubscribed(true);
							}}
							className="space-y-4"
						>
							<div>
								<label htmlFor="sub-name" className="block text-sm font-medium text-[#1f2937] mb-1">
									First name
								</label>
								<input
									id="sub-name"
									type="text"
									required
									placeholder="Your first name"
									className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e07030] focus:ring-1 focus:ring-[#e07030]"
								/>
							</div>
							<div>
								<label htmlFor="sub-email" className="block text-sm font-medium text-[#1f2937] mb-1">
									Email address
								</label>
								<input
									id="sub-email"
									type="email"
									required
									placeholder="you@example.com"
									className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e07030] focus:ring-1 focus:ring-[#e07030]"
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-[#e07030] hover:bg-[#c05a20] text-white font-semibold py-3 rounded-full transition-colors"
							>
								Subscribe — it's free
							</button>
							<p className="text-xs text-gray-400 text-center">
								No spam. Unsubscribe anytime.
							</p>
						</form>
					)}
				</section>

				{/* Contact form */}
				<section className="bg-white rounded-2xl border border-gray-100 p-8">
					<h2 className="text-2xl font-bold text-[#1f2937] mb-2">Send a message</h2>
					<p className="text-gray-500 text-sm mb-6">
						Have a recipe suggestion? Want to share how a plan worked for your family? I'd love to hear it.
					</p>
					<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
						<div>
							<label htmlFor="msg-name" className="block text-sm font-medium text-[#1f2937] mb-1">
								Name
							</label>
							<input
								id="msg-name"
								type="text"
								placeholder="Your name"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e07030] focus:ring-1 focus:ring-[#e07030]"
							/>
						</div>
						<div>
							<label htmlFor="msg-email" className="block text-sm font-medium text-[#1f2937] mb-1">
								Email
							</label>
							<input
								id="msg-email"
								type="email"
								placeholder="you@example.com"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e07030] focus:ring-1 focus:ring-[#e07030]"
							/>
						</div>
						<div>
							<label htmlFor="msg-message" className="block text-sm font-medium text-[#1f2937] mb-1">
								Message
							</label>
							<textarea
								id="msg-message"
								rows={4}
								placeholder="What's on your mind?"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e07030] focus:ring-1 focus:ring-[#e07030] resize-none"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-[#1f2937] hover:bg-[#374151] text-white font-semibold py-3 rounded-full transition-colors"
						>
							Send message
						</button>
						<p className="text-xs text-gray-400 text-center">
							Backend integration coming soon — messages noted for now.
						</p>
					</form>
				</section>
			</div>
		</>
	);
}
