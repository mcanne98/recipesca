import mealPlans from "./mealPlans";
import { standaloneRecipes } from "./standaloneRecipes";
import type { Recipe } from "./types";

export const allRecipes: Recipe[] = [
	...mealPlans.flatMap((p) => p.recipes),
	...standaloneRecipes,
];

export function findRecipeById(id: string): Recipe | undefined {
	return allRecipes.find((r) => r.id === id);
}
