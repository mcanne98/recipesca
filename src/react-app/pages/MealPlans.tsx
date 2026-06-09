import mealPlans from "../data/mealPlans";
import MealPlanCard from "../components/MealPlanCard";

export default function MealPlans() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-16">
			<div className="mb-12">
				<h1 className="text-4xl font-bold text-[#1f2937] mb-3">Weekly Meal Plans</h1>
				<p className="text-gray-500 text-lg max-w-2xl">
					Each plan covers 7 full days for a family of four — with a shopping list, batch prep schedule, and recipe cards. Pick one and you're set for the week.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{mealPlans.map((plan) => (
					<MealPlanCard key={plan.id} plan={plan} />
				))}
			</div>
		</div>
	);
}
