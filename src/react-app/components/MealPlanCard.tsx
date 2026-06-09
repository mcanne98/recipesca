import { Link } from "react-router-dom";
import type { MealPlan } from "../data/types";
import TagBadge from "./TagBadge";

export default function MealPlanCard({ plan }: { plan: MealPlan }) {
	const date = new Date(plan.publishedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Link to={`/meal-plans/${plan.slug}`} className="block group">
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
				<span className="text-xs text-[#e07030] font-semibold uppercase tracking-wide mb-3 block">
					{date}
				</span>
				<h3 className="text-xl font-bold text-[#1f2937] mb-1 group-hover:text-[#e07030] transition-colors">
					{plan.title}
				</h3>
				<p className="text-gray-500 text-sm mb-4">{plan.subtitle}</p>
				<div className="flex flex-wrap gap-2 mb-4">
					{plan.tags.map((tag) => (
						<TagBadge key={tag} tag={tag} />
					))}
				</div>
				<div className="mt-auto grid grid-cols-2 gap-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
					<div>
						<span className="font-semibold text-[#1f2937] block">Prep time</span>
						{plan.prepTime}
					</div>
					<div>
						<span className="font-semibold text-[#1f2937] block">Meals</span>
						{plan.mealCount} total
					</div>
					<div>
						<span className="font-semibold text-[#1f2937] block">Family</span>
						{plan.familySize}
					</div>
					<div>
						<span className="font-semibold text-[#1f2937] block">Key ingredients</span>
						{plan.keyIngredients.slice(0, 2).join(", ")}
					</div>
				</div>
			</div>
		</Link>
	);
}
