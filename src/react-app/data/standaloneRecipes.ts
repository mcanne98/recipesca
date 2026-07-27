import type { Recipe } from "./types";

export const standaloneRecipes: Recipe[] = [
	{
		id: "standalone-french-crepes",
		name: "French Crêpes",
		image: "/images/recipes/plated/french-crepes.jpg",
		mealType: "breakfast",
		prepTime: 10,
		cookTime: 25,
		servings: 4,
		ingredients: [
			"1 cup (150 g) all-purpose unbleached flour",
			"2 tbsp sugar",
			"1 pinch of salt",
			"2 eggs",
			"1½ cups (375 ml) milk",
			"½ tsp vanilla extract",
			"1 tbsp unsalted butter, melted",
			"Softened butter, for cooking",
		],
		instructions: [
			"In a large bowl, whisk together the flour, sugar, and salt.",
			"Make a well in the centre and add the eggs. Whisk from the centre outward, gradually incorporating the flour.",
			"Slowly whisk in the milk until the batter is smooth and lump-free.",
			"Stir in the vanilla extract and melted butter.",
			"Let the batter rest for at least 30 minutes at room temperature (or overnight in the fridge).",
			"Heat a 10-inch non-stick or crêpe pan over medium heat. Add a small knob of softened butter and swirl to coat.",
			"Pour about ¼ cup of batter into the pan, immediately tilting and rotating to spread into a thin, even round.",
			"Cook for 1–1½ minutes until the edges look dry and the underside is lightly golden, then flip and cook 30 seconds more.",
			"Repeat with remaining batter, adding butter to the pan as needed. Stack finished crêpes on a plate. Makes about 14 crêpes.",
		],
		tags: ["Kid Approved", "Quick Prep"],
		storageNotes: "Stack cooled crêpes with parchment between each one. Refrigerate up to 3 days or freeze up to 2 months. Reheat in a dry pan over low heat or microwave for 20 seconds.",
		kidTip: "Let kids choose their own fillings — Nutella & banana, jam, or just a squeeze of lemon and sugar are all crowd-pleasers.",
	},
];
