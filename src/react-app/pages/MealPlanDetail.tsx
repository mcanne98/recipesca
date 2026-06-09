import { useParams, Link } from "react-router-dom";
import mealPlans from "../data/mealPlans";
import TagBadge from "../components/TagBadge";
import MealPlanTable from "../components/MealPlanTable";
import ShoppingList from "../components/ShoppingList";
import PrepSchedule from "../components/PrepSchedule";
import RecipeCard from "../components/RecipeCard";
import SubscribeCTA from "../components/SubscribeCTA";

export default function MealPlanDetail() {
	const { slug } = useParams<{ slug: string }>();
	const plan = mealPlans.find((p) => p.slug === slug);

	if (!plan) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-24 text-center">
				<h1 className="text-2xl font-bold text-[#1f2937] mb-4">Plan not found</h1>
				<Link to="/meal-plans" className="text-[#e07030] hover:underline">
					← Back to meal plans
				</Link>
			</div>
		);
	}

	const date = new Date(plan.publishedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<>
			{/* Header */}
			<section className="bg-[#1f2937] text-white py-16 px-4">
				<div className="max-w-4xl mx-auto">
					<Link to="/meal-plans" className="text-gray-400 hover:text-white text-sm mb-6 inline-block transition-colors">
						← All Meal Plans
					</Link>
					<div className="flex flex-wrap gap-2 mb-4">
						{plan.tags.map((tag) => (
							<TagBadge key={tag} tag={tag} />
						))}
					</div>
					<h1 className="text-3xl md:text-5xl font-bold mb-3">{plan.title}</h1>
					<p className="text-gray-300 text-lg mb-6">{plan.subtitle}</p>
					<div className="flex flex-wrap gap-6 text-sm text-gray-300">
						<span>⏱️ Prep: {plan.prepTime}</span>
						<span>👨‍👧‍👦 {plan.familySize}</span>
						<span>🍽️ {plan.mealCount} meals</span>
						<span>📅 {date}</span>
					</div>
				</div>
			</section>

			<div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
				{/* Intro */}
				<section>
					<p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-[#e07030] pl-6">
						{plan.intro}
					</p>
				</section>

				{/* 7-Day Table */}
				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-6">7-Day Meal Plan</h2>
					<MealPlanTable days={plan.days} />
				</section>

				{/* Shopping List */}
				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-2">Shopping List</h2>
					<p className="text-gray-500 text-sm mb-6">Everything you need. Check off as you go.</p>
					<ShoppingList items={plan.shoppingList} />
				</section>

				{/* Prep Schedule */}
				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-2">Batch Prep Schedule</h2>
					<p className="text-gray-500 text-sm mb-8">
						Target: {plan.prepTime}. Set a timer and follow the steps.
					</p>
					<PrepSchedule steps={plan.prepSchedule} />
				</section>

				{/* Recipes */}
				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-6">Recipe Cards</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{plan.recipes.map((recipe) => (
							<RecipeCard key={recipe.id} recipe={recipe} />
						))}
					</div>
				</section>

				{/* Notes */}
				<section className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
					<div>
						<h2 className="text-xl font-bold text-[#1f2937] mb-3">Storage & Reheating</h2>
						<p className="text-gray-600 text-sm leading-relaxed">{plan.storageNotes}</p>
					</div>
					<div>
						<h2 className="text-xl font-bold text-[#1f2937] mb-3">Kid-Friendly Tips</h2>
						<ul className="space-y-2">
							{plan.kidTips.map((tip, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-gray-600">
									<span className="text-[#e07030] font-bold flex-shrink-0">→</span>
									<span>{tip}</span>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h2 className="text-xl font-bold text-[#1f2937] mb-3">Estimated Leftovers</h2>
						<p className="text-gray-600 text-sm leading-relaxed">{plan.estimatedLeftovers}</p>
					</div>
				</section>
			</div>

			<SubscribeCTA />
		</>
	);
}
