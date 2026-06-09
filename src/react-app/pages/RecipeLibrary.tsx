import { useState } from "react";
import mealPlans from "../data/mealPlans";
import type { MealType, Tag } from "../data/types";
import RecipeCard from "../components/RecipeCard";

const allRecipes = mealPlans.flatMap((p) => p.recipes);

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const allTags: Tag[] = [
	"High Protein",
	"Budget Friendly",
	"Kid Approved",
	"Freezer Friendly",
	"Vegetarian",
	"Quick Prep",
];

export default function RecipeLibrary() {
	const [mealFilter, setMealFilter] = useState<MealType | "all">("all");
	const [tagFilter, setTagFilter] = useState<Tag | "all">("all");

	const filtered = allRecipes.filter((r) => {
		const mealMatch = mealFilter === "all" || r.mealType === mealFilter;
		const tagMatch = tagFilter === "all" || r.tags.includes(tagFilter);
		return mealMatch && tagMatch;
	});

	const btn = (active: boolean) =>
		`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
			active
				? "bg-[#e07030] border-[#e07030] text-white"
				: "border-gray-300 text-gray-600 hover:border-[#e07030] hover:text-[#e07030] bg-white"
		}`;

	return (
		<div className="max-w-6xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-[#1f2937] mb-3">Recipe Library</h1>
			<p className="text-gray-500 text-lg mb-10 max-w-2xl">
				Every recipe from every meal plan — searchable and filterable. All tested in a real kitchen with real kids.
			</p>

			<div className="mb-10 space-y-4">
				<div>
					<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Meal type</p>
					<div className="flex flex-wrap gap-2">
						<button className={btn(mealFilter === "all")} onClick={() => setMealFilter("all")}>
							All
						</button>
						{mealTypes.map((t) => (
							<button key={t} className={btn(mealFilter === t)} onClick={() => setMealFilter(t)}>
								{t.charAt(0).toUpperCase() + t.slice(1)}
							</button>
						))}
					</div>
				</div>
				<div>
					<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Filter by tag</p>
					<div className="flex flex-wrap gap-2">
						<button className={btn(tagFilter === "all")} onClick={() => setTagFilter("all")}>
							All
						</button>
						{allTags.map((t) => (
							<button key={t} className={btn(tagFilter === t)} onClick={() => setTagFilter(t)}>
								{t}
							</button>
						))}
					</div>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-20 text-gray-400 text-lg">
					No recipes match those filters.
				</div>
			) : (
				<>
					<p className="text-sm text-gray-400 mb-6">{filtered.length} recipe{filtered.length !== 1 ? "s" : ""}</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filtered.map((recipe) => (
							<RecipeCard key={recipe.id} recipe={recipe} />
						))}
					</div>
				</>
			)}
		</div>
	);
}
