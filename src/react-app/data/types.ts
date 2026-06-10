export type Tag =
	| "High Protein"
	| "Budget Friendly"
	| "Kid Approved"
	| "Freezer Friendly"
	| "Vegetarian"
	| "Quick Prep";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type ShoppingCategory =
	| "Produce"
	| "Protein"
	| "Dairy"
	| "Pantry"
	| "Frozen"
	| "Snacks"
	| "Other";

export interface Recipe {
	id: string;
	name: string;
	image?: string;
	mealType: MealType;
	prepTime: number;
	cookTime: number;
	servings: number;
	ingredients: string[];
	instructions: string[];
	tags: Tag[];
	storageNotes?: string;
	reheatingNotes?: string;
	substitutions?: string[];
	kidTip?: string;
}

export interface DayMeals {
	day: string;
	breakfast: string;
	lunch: string;
	dinner: string;
	snack?: string;
}

export interface ShoppingItem {
	category: ShoppingCategory;
	items: string[];
}

export interface PrepStep {
	timeRange: string;
	task: string;
	details?: string;
}

export interface MealPlan {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	image?: string;
	intro: string;
	prepTime: string;
	familySize: string;
	mealCount: number;
	keyIngredients: string[];
	tags: Tag[];
	days: DayMeals[];
	shoppingList: ShoppingItem[];
	prepSchedule: PrepStep[];
	recipes: Recipe[];
	storageNotes: string;
	kidTips: string[];
	estimatedLeftovers: string;
	publishedAt: string;
}
