import { Link } from "react-router-dom";
import mealPlans from "../data/mealPlans";
import MealPlanCard from "../components/MealPlanCard";
import SubscribeCTA from "../components/SubscribeCTA";

export default function Home() {
	return (
		<>
			{/* Hero */}
			<section className="bg-[#1f2937] text-white py-24 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-[#e07030] font-semibold uppercase tracking-widest text-sm mb-4">
						Week On Week Off Kitchen
					</p>
					<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
						Seven days of meals,<br />prepped in one afternoon.
					</h1>
					<p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
						A dad's guide to cooking real, healthy food for three kids during the parenting week. No takeout. No meal kits. Just a Sunday prep session and a fridge full of good food.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/meal-plans"
							className="bg-[#e07030] hover:bg-[#c05a20] text-white font-semibold px-8 py-3 rounded-full transition-colors"
						>
							Browse Meal Plans
						</Link>
						<Link
							to="/about"
							className="border border-gray-500 hover:border-white text-white font-semibold px-8 py-3 rounded-full transition-colors"
						>
							Our Story
						</Link>
					</div>
				</div>
			</section>

			{/* Philosophy strip */}
			<section className="bg-[#e07030] text-white py-4 px-4">
				<div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium">
					<span>✓ Cooked meals, not bought ones</span>
					<span>✓ Kid-approved recipes</span>
					<span>✓ 3–4 hour Sunday prep</span>
					<span>✓ Full shopping lists included</span>
				</div>
			</section>

			{/* How it works */}
			<section className="py-20 px-4 bg-[#faf8f4]">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl font-bold text-[#1f2937] text-center mb-3">The Sunday Prep System</h2>
					<p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
						Every week follows the same simple structure. One prep session powers the entire week.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								step: "1",
								title: "Plan on Friday",
								desc: "Pick a weekly meal plan, check the shopping list, and shop on Saturday.",
							},
							{
								step: "2",
								title: "Prep on Sunday",
								desc: "Set aside 3–4 hours. Follow the batch prep schedule. Cook everything in one session.",
							},
							{
								step: "3",
								title: "Eat well all week",
								desc: "Pull meals from the fridge each day. Reheat, assemble, and enjoy dinner with your kids.",
							},
						].map((item) => (
							<div key={item.step} className="text-center">
								<div className="w-12 h-12 rounded-full bg-[#e07030] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
									{item.step}
								</div>
								<h3 className="font-bold text-lg text-[#1f2937] mb-2">{item.title}</h3>
								<p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured plans */}
			<section className="py-20 px-4 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center justify-between mb-10">
						<h2 className="text-3xl font-bold text-[#1f2937]">Recent Meal Plans</h2>
						<Link to="/meal-plans" className="text-[#e07030] font-medium hover:underline text-sm">
							View all →
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{mealPlans.map((plan) => (
							<MealPlanCard key={plan.id} plan={plan} />
						))}
					</div>
				</div>
			</section>

			{/* Quote */}
			<section className="py-20 px-4 bg-[#faf8f4]">
				<div className="max-w-3xl mx-auto text-center">
					<blockquote className="text-2xl md:text-4xl font-bold text-[#1f2937] leading-tight mb-6">
						"Less takeout.<br className="hidden md:block" /> More table time."
					</blockquote>
					<p className="text-gray-500 text-lg">
						Every week I cook for my kids is a week I don't regret. This site is how I stay organized enough to pull it off.
					</p>
				</div>
			</section>

			<SubscribeCTA />
		</>
	);
}
