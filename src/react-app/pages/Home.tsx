import { Link } from "react-router-dom";
import { useState } from "react";
import mealPlans from "../data/mealPlans";
import MealPlanCard from "../components/MealPlanCard";

// Mini recipe preview card
function RecipePreviewCard({
	emoji, name, mealType, time, tag,
}: { emoji: string; name: string; mealType: string; time: string; tag: string }) {
	return (
		<Link to="/recipes" className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300">
			<div className="bg-[#faf8f4] aspect-square flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
				{emoji}
			</div>
			<div className="p-4">
				<span className="text-xs text-[#e07030] font-bold uppercase tracking-wide">{mealType} · {time}</span>
				<h4 className="font-bold text-[#1f2937] text-sm mt-1 leading-snug group-hover:text-[#e07030] transition-colors">{name}</h4>
				<span className="inline-block mt-2 text-xs bg-[#faf8f4] text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{tag}</span>
			</div>
		</Link>
	);
}

const featuredRecipes = [
	{ emoji: "🍗", name: "Sheet Pan Chicken & Roasted Broccoli", mealType: "Dinner", time: "40 min", tag: "Kid Approved" },
	{ emoji: "🌮", name: "Simple Beef Tacos", mealType: "Dinner", time: "20 min", tag: "Quick Prep" },
	{ emoji: "🥣", name: "Overnight Oats", mealType: "Breakfast", time: "5 min", tag: "Kid Approved" },
	{ emoji: "🥣", name: "Homemade Chicken Soup", mealType: "Dinner", time: "55 min", tag: "Freezer Friendly" },
];

const stats = [
	{ number: "21", label: "Meals per week" },
	{ number: "3–4h", label: "Sunday prep time" },
	{ number: "100%", label: "Home-cooked" },
	{ number: "0", label: "Takeout orders" },
];

function NewsletterSection() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("loading");
		setErrorMsg("");
		try {
			const res = await fetch("/api/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim(), email: email.trim() }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			setStatus("success");
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
			setStatus("error");
		}
	}

	return (
		<section className="py-16 px-4 bg-[#faf8f4] border-t border-gray-200">
			<div className="max-w-2xl mx-auto text-center">
				<div className="text-5xl mb-5">📬</div>
				<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-2">Free Recipe Club</p>
				<h2 className="text-3xl md:text-4xl font-black text-[#1f2937] mb-3">
					Get next week's meal plan free
				</h2>
				<p className="text-gray-500 mb-8 max-w-md mx-auto">
					New plan every Monday — shopping list, batch prep schedule, and recipe cards. No spam, ever.
				</p>

				{status === "success" ? (
					<div className="bg-[#7a9e7e]/10 border border-[#7a9e7e]/30 rounded-2xl px-8 py-6 max-w-md mx-auto">
						<div className="text-3xl mb-2">🎉</div>
						<p className="font-black text-[#1f2937] text-lg mb-1">You're in!</p>
						<p className="text-gray-500 text-sm">Check your inbox — next week's plan drops Monday.</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
						<div className="flex flex-col sm:flex-row gap-3">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
								required
								disabled={status === "loading"}
								className="flex-1 border-2 border-gray-200 focus:border-[#e07030] rounded-full px-5 py-3 text-sm focus:outline-none transition-colors disabled:opacity-60"
							/>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
								disabled={status === "loading"}
								className="flex-1 border-2 border-gray-200 focus:border-[#e07030] rounded-full px-5 py-3 text-sm focus:outline-none transition-colors disabled:opacity-60"
							/>
						</div>
						<button
							type="submit"
							disabled={status === "loading"}
							className="bg-[#e07030] hover:bg-[#c05a20] disabled:opacity-60 text-white font-bold px-7 py-3 rounded-full text-sm transition-colors shadow-md shadow-orange-100 flex items-center justify-center gap-2"
						>
							{status === "loading" ? (
								<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Subscribing…</>
							) : "Subscribe Free"}
						</button>
					</form>
				)}

				{status === "error" && (
					<p className="text-red-500 text-sm mt-3">{errorMsg}</p>
				)}

				<p className="text-xs text-gray-400 mt-4">Join other parents cooking real food for their kids. Unsubscribe anytime.</p>
			</div>
		</section>
	);
}

export default function Home() {
	return (
		<div className="bg-[#faf8f4]">

			{/* ── HERO ────────────────────────────────────── */}
			<section className="bg-white border-b border-gray-100">
				<div className="max-w-6xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-12 items-center">
					{/* Left: text */}
					<div>
						<div className="inline-flex items-center gap-2 bg-[#fff4ee] text-[#e07030] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
							<span>🍳</span> Dad-Focused Meal Planning
						</div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1f2937] leading-[1.08] mb-5">
							One Week.<br />
							Three Kids.<br />
							<span className="text-[#e07030]">Real Food.</span>
						</h1>
						<p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
							A dad's system for cooking healthy, home-made meals during the parenting week — prepped in one Sunday afternoon.
						</p>
						<div className="flex flex-wrap gap-3 mb-10">
							<Link
								to="/meal-plans"
								className="bg-[#e07030] hover:bg-[#c05a20] text-white font-bold px-7 py-3.5 rounded-full text-base transition-colors shadow-md shadow-orange-100"
							>
								Browse Meal Plans
							</Link>
							<Link
								to="/about"
								className="bg-[#faf8f4] hover:bg-gray-100 text-[#1f2937] font-semibold px-7 py-3.5 rounded-full text-base transition-colors border border-gray-200"
							>
								Our Story
							</Link>
						</div>
						{/* Mini trust row */}
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
							<span className="flex items-center gap-1.5"><span className="text-[#7a9e7e] font-bold">✓</span> No takeout</span>
							<span className="flex items-center gap-1.5"><span className="text-[#7a9e7e] font-bold">✓</span> Kid-approved meals</span>
							<span className="flex items-center gap-1.5"><span className="text-[#7a9e7e] font-bold">✓</span> Full shopping lists</span>
							<span className="flex items-center gap-1.5"><span className="text-[#7a9e7e] font-bold">✓</span> Batch prep schedules</span>
						</div>
					</div>

					{/* Right: stacked card preview */}
					<div className="hidden md:block relative">
						{/* Background card (decorative) */}
						<div className="absolute top-4 right-4 left-4 bottom-0 bg-[#e07030]/10 rounded-3xl rotate-2" />
						<div className="absolute top-2 right-2 left-2 bottom-0 bg-[#e07030]/5 rounded-3xl -rotate-1" />
						{/* Main preview card */}
						<div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
							<div className="h-48 relative overflow-hidden">
								{mealPlans[0].image ? (
									<img src={mealPlans[0].image} alt={mealPlans[0].title} className="w-full h-full object-cover" />
								) : (
									<div className="bg-gradient-to-br from-[#e07030] via-[#f09040] to-[#f5b86e] w-full h-full flex items-center justify-center">
										<span className="text-8xl drop-shadow-md">🍗</span>
									</div>
								)}
								<div className="absolute top-3 right-3 bg-white/90 text-[#1f2937] text-xs font-bold px-3 py-1 rounded-full">
									⏱ 3.5 hours
								</div>
							</div>
							<div className="p-6">
								<span className="text-xs text-[#e07030] font-bold uppercase tracking-widest">This week's plan</span>
								<h3 className="text-xl font-black text-[#1f2937] mt-1 mb-2">The Protein-Packed Week</h3>
								<p className="text-gray-500 text-sm mb-4">High-energy meals to fuel your kids all week long</p>
								<div className="flex gap-3 text-xs">
									<span className="bg-[#e07030] text-white px-2.5 py-1 rounded-full font-semibold">High Protein</span>
									<span className="bg-yellow-400 text-[#1f2937] px-2.5 py-1 rounded-full font-semibold">Kid Approved</span>
								</div>
								<div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
									<div><div className="font-black text-[#1f2937]">21</div><div className="text-xs text-gray-400">meals</div></div>
									<div><div className="font-black text-[#1f2937]">4</div><div className="text-xs text-gray-400">recipes</div></div>
									<div><div className="font-black text-[#1f2937]">1</div><div className="text-xs text-gray-400">prep session</div></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── STATS STRIP ─────────────────────────────── */}
			<section className="bg-[#1f2937] text-white">
				<div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					{stats.map((s) => (
						<div key={s.label}>
							<div className="text-3xl font-black text-[#e07030]">{s.number}</div>
							<div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</div>
						</div>
					))}
				</div>
			</section>

			{/* ── LATEST MEAL PLANS ────────────────────────── */}
			<section className="py-16 px-4 bg-[#faf8f4]">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-end justify-between mb-3">
						<div>
							<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-1">Weekly Plans</p>
							<h2 className="text-3xl md:text-4xl font-black text-[#1f2937]">Recent Meal Plans</h2>
						</div>
						<Link to="/meal-plans" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#e07030] hover:underline">
							View all <span>→</span>
						</Link>
					</div>
					<p className="text-gray-500 mb-10 max-w-xl">
						Every plan includes a 7-day table, full shopping list, batch prep schedule, and recipe cards.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{mealPlans.map((plan, i) => (
							<MealPlanCard key={plan.id} plan={plan} index={i} />
						))}
					</div>

					<div className="mt-8 text-center sm:hidden">
						<Link to="/meal-plans" className="inline-block text-sm font-bold text-[#e07030] hover:underline">
							View all meal plans →
						</Link>
					</div>
				</div>
			</section>

			{/* ── HOW IT WORKS ────────────────────────────── */}
			<section className="py-16 px-4 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-1">The System</p>
						<h2 className="text-3xl md:text-4xl font-black text-[#1f2937] mb-3">The Sunday Prep Method</h2>
						<p className="text-gray-500 max-w-lg mx-auto">
							One focused afternoon powers seven days of home-cooked dinners. Here's the playbook.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ step: "01", icon: "📋", title: "Plan on Friday", desc: "Pick a weekly plan and check the shopping list. Takes 10 minutes tops." },
							{ step: "02", icon: "🛒", title: "Shop on Saturday", desc: "One trip. Everything on the list. No mid-week emergency grocery runs." },
							{ step: "03", icon: "🍳", title: "Prep on Sunday", desc: "3–4 hours in the kitchen. Follow the schedule. Load the fridge." },
						].map((item) => (
							<div key={item.step} className="bg-[#faf8f4] rounded-2xl p-7 relative overflow-hidden group hover:shadow-md transition-shadow">
								<div className="absolute top-4 right-5 text-6xl font-black text-[#e07030] opacity-10 select-none group-hover:opacity-20 transition-opacity">
									{item.step}
								</div>
								<div className="text-4xl mb-4">{item.icon}</div>
								<h3 className="font-black text-lg text-[#1f2937] mb-2">{item.title}</h3>
								<p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
							</div>
						))}
					</div>
					<div className="mt-8 bg-[#faf8f4] rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-200">
						<div className="text-4xl">🧊</div>
						<div>
							<h3 className="font-black text-[#1f2937] text-lg mb-1">Then just eat all week.</h3>
							<p className="text-gray-500 text-sm">Pull meals from the fridge, reheat, plate. No decision fatigue on busy weeknights.</p>
						</div>
					</div>
				</div>
			</section>

			{/* ── RECIPE PREVIEW ──────────────────────────── */}
			<section className="py-16 px-4 bg-[#faf8f4]">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-end justify-between mb-3">
						<div>
							<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-1">From the Library</p>
							<h2 className="text-3xl md:text-4xl font-black text-[#1f2937]">Popular Recipes</h2>
						</div>
						<Link to="/recipes" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#e07030] hover:underline">
							View all <span>→</span>
						</Link>
					</div>
					<p className="text-gray-500 mb-10 max-w-xl">
						Every recipe is batch-cook tested and kid-approved. Searchable by meal type, diet, and prep style.
					</p>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{featuredRecipes.map((r) => (
							<RecipePreviewCard key={r.name} {...r} />
						))}
					</div>
					<div className="mt-8 text-center">
						<Link
							to="/recipes"
							className="inline-block border-2 border-[#e07030] text-[#e07030] hover:bg-[#e07030] hover:text-white font-bold px-8 py-3 rounded-full transition-colors"
						>
							Browse All Recipes →
						</Link>
					</div>
				</div>
			</section>

			{/* ── PERSONAL STORY STRIP ────────────────────── */}
			<section className="py-16 px-4 bg-[#1f2937] text-white">
				<div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
					<div>
						<p className="text-[#e07030] text-sm font-bold uppercase tracking-widest mb-3">The Dad Behind This</p>
						<h2 className="text-3xl md:text-4xl font-black mb-5 leading-tight">
							"I got tired of takeout being the easy answer."
						</h2>
						<p className="text-gray-300 leading-relaxed mb-6">
							Week-on/week-off parenting is hard enough without the added stress of "what's for dinner?" every single night. So I built a system: plan once, prep once, eat well all week.
						</p>
						<p className="text-gray-300 leading-relaxed mb-8">
							Everything on this site has been cooked in my actual kitchen, tested on my actual kids, and refined over actual parenting weeks. No fluff. Just food that works.
						</p>
						<Link to="/about" className="inline-block border border-gray-500 hover:border-white text-white font-semibold px-6 py-3 rounded-full transition-colors">
							Read the full story →
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-4">
						{[
							{ icon: "👨‍🍳", label: "Real dad", sub: "Not a chef. Just someone who figured it out." },
							{ icon: "🏠", label: "Home kitchen", sub: "Everything works with basic equipment." },
							{ icon: "👧👦👦", label: "3 kids", sub: "Different taste buds, all accounted for." },
							{ icon: "📅", label: "Week-on schedule", sub: "Built for the parenting week structure." },
						].map((item) => (
							<div key={item.label} className="bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
								<div className="text-3xl mb-2">{item.icon}</div>
								<div className="font-bold text-white text-sm">{item.label}</div>
								<div className="text-gray-400 text-xs mt-1 leading-snug">{item.sub}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── NEWSLETTER ──────────────────────────────── */}
			<NewsletterSection />

		</div>
	);
}
