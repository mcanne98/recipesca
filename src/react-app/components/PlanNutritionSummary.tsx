import type { Recipe } from "../data/types";

interface Props {
	recipes: Recipe[];
}

export default function PlanNutritionSummary({ recipes }: Props) {
	const withNutrition = recipes.filter((r) => r.nutrition);
	if (withNutrition.length === 0) return null;

	const totals = withNutrition.reduce(
		(acc, r) => ({
			calories: acc.calories + (r.nutrition!.calories ?? 0),
			protein: acc.protein + (r.nutrition!.protein ?? 0),
			carbs: acc.carbs + (r.nutrition!.carbs ?? 0),
			fat: acc.fat + (r.nutrition!.fat ?? 0),
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0 }
	);

	return (
		<section>
			<h2 className="text-2xl font-bold text-[#1f2937] mb-2">Nutrition Summary</h2>
			<p className="text-gray-500 text-sm mb-5">Per serving · USDA-estimated values</p>
			<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
				{/* Header */}
				<div className="grid grid-cols-5 bg-[#1f2937] text-white text-xs font-bold uppercase tracking-wide px-4 py-3">
					<div className="col-span-1">Recipe</div>
					<div className="text-right">Calories</div>
					<div className="text-right">Protein</div>
					<div className="text-right">Carbs</div>
					<div className="text-right">Fat</div>
				</div>
				{/* Rows */}
				{withNutrition.map((r, i) => (
					<div
						key={r.id}
						className={`grid grid-cols-5 px-4 py-3 text-sm items-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
					>
						<div className="col-span-1 font-medium text-[#1f2937] pr-2 truncate" title={r.name}>
							{r.name}
						</div>
						<div className="text-right text-gray-700">{r.nutrition!.calories}</div>
						<div className="text-right text-gray-700">{r.nutrition!.protein}g</div>
						<div className="text-right text-gray-700">{r.nutrition!.carbs}g</div>
						<div className="text-right text-gray-700">{r.nutrition!.fat}g</div>
					</div>
				))}
				{/* Totals */}
				<div className="grid grid-cols-5 px-4 py-3 text-sm font-bold border-t-2 border-[#e07030] bg-orange-50">
					<div className="col-span-1 text-[#e07030]">Total</div>
					<div className="text-right text-[#e07030]">{Math.round(totals.calories)}</div>
					<div className="text-right text-[#e07030]">{Math.round(totals.protein * 10) / 10}g</div>
					<div className="text-right text-[#e07030]">{Math.round(totals.carbs * 10) / 10}g</div>
					<div className="text-right text-[#e07030]">{Math.round(totals.fat * 10) / 10}g</div>
				</div>
			</div>
			<p className="mt-2 text-xs text-gray-400">
				Nutritional values are estimates based on ingredient quantities and standard food composition data. Actual values may vary.
			</p>
		</section>
	);
}
