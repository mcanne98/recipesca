import type { Recipe } from "../data/types";
import TagBadge from "./TagBadge";

const mealTypeLabel: Record<Recipe["mealType"], string> = {
	breakfast: "☀️ Breakfast",
	lunch: "🥗 Lunch",
	dinner: "🍽️ Dinner",
	snack: "🍎 Snack",
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
	const totalTime = recipe.prepTime + recipe.cookTime;

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
			{recipe.image && (
				<div className="aspect-[4/3] overflow-hidden">
					<img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
				</div>
			)}
			<div className="p-6 flex flex-col flex-1">
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs font-semibold text-[#7a9e7e] uppercase tracking-wide">
					{mealTypeLabel[recipe.mealType]}
				</span>
				<span className="text-xs text-gray-400">{totalTime} min total</span>
			</div>
			<h3 className="text-lg font-bold text-[#1f2937] mb-3">{recipe.name}</h3>
			<div className="flex flex-wrap gap-1.5 mb-4">
				{recipe.tags.map((tag) => (
					<TagBadge key={tag} tag={tag} />
				))}
			</div>
			<div className="mb-4">
				<h4 className="text-sm font-semibold text-[#1f2937] mb-2">Ingredients</h4>
				<ul className="text-sm text-gray-600 space-y-1">
					{recipe.ingredients.map((ing, i) => (
						<li key={i} className="flex items-start gap-2">
							<span className="text-[#e07030] mt-0.5 flex-shrink-0">•</span>
							<span>{ing}</span>
						</li>
					))}
				</ul>
			</div>
			<div className="mb-4">
				<h4 className="text-sm font-semibold text-[#1f2937] mb-2">Instructions</h4>
				<ol className="text-sm text-gray-600 space-y-2">
					{recipe.instructions.map((step, i) => (
						<li key={i} className="flex items-start gap-2">
							<span className="font-bold text-[#e07030] min-w-[1.25rem] flex-shrink-0">{i + 1}.</span>
							<span>{step}</span>
						</li>
					))}
				</ol>
			</div>
			{recipe.kidTip && (
				<div className="mt-auto bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800 border border-yellow-100">
					<span className="font-semibold">👧 Kid Tip:</span> {recipe.kidTip}
				</div>
			)}
			{recipe.storageNotes && (
				<p className="mt-3 text-xs text-gray-400 italic">{recipe.storageNotes}</p>
			)}
			</div>
		</div>
	);
}
