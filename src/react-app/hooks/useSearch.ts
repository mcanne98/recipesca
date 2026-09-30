import { useState, useEffect, useMemo } from "react";
import mealPlans from "../data/mealPlans";
import { allRecipes } from "../data/allRecipes";
import type { MealPlan, Recipe } from "../data/types";

const API_BASE = import.meta.env.DEV ? "http://localhost:8787" : "";

export type SearchResultKind = "plan" | "recipe";

export interface SearchResult {
	kind: SearchResultKind;
	id: string;          // plan slug or recipe id
	title: string;
	subtitle: string;
	image?: string;
	tags: string[];
	likes: number;
	url: string;
}

// Fetch all like counts in one go (list KV prefix "likes:" via a single endpoint)
// We approximate by fetching counts for every plan slug + recipe id in parallel,
// batched into a single bulk request to avoid 100s of individual calls.
async function fetchAllLikes(
	plans: MealPlan[],
	recipes: Recipe[]
): Promise<Map<string, number>> {
	const map = new Map<string, number>();
	try {
		const items = [
			...plans.map((p) => ({ type: "plan" as const, id: p.slug })),
			...recipes.map((r) => ({ type: "recipe" as const, id: r.id })),
		];
		// fire all in parallel — KV reads are fast
		const results = await Promise.allSettled(
			items.map((item) =>
				fetch(`${API_BASE}/api/likes?type=${item.type}&id=${encodeURIComponent(item.id)}`)
					.then((r) => r.json() as Promise<{ count: number }>)
					.then((d) => ({ key: `${item.type}:${item.id}`, count: d.count ?? 0 }))
			)
		);
		for (const r of results) {
			if (r.status === "fulfilled") {
				map.set(r.value.key, r.value.count);
			}
		}
	} catch { /* no likes available — search still works */ }
	return map;
}

function normalize(s: string) {
	return s.toLowerCase().trim();
}

function score(result: SearchResult, query: string, likes: Map<string, number>): number {
	const q = normalize(query);
	const title = normalize(result.title);
	const subtitle = normalize(result.subtitle);
	const tags = result.tags.map(normalize).join(" ");
	const likeCount = likes.get(`${result.kind}:${result.id}`) ?? 0;

	let base = 0;
	if (title.startsWith(q)) base = 100;
	else if (title.includes(q)) base = 80;
	else if (subtitle.includes(q)) base = 60;
	else if (tags.includes(q)) base = 40;

	// Boost by likes (log scale so 1 like doesn't dominate, 100 likes adds ~20pts)
	const likesBoost = likeCount > 0 ? Math.min(20, Math.log10(likeCount + 1) * 10) : 0;
	return base + likesBoost;
}

export function useSearch() {
	const [query, setQuery] = useState("");
	const [likes, setLikes] = useState<Map<string, number>>(new Map());

	useEffect(() => {
		fetchAllLikes(mealPlans, allRecipes).then(setLikes);
	}, []);

	const planResults: SearchResult[] = useMemo(
		() =>
			mealPlans.map((p) => ({
				kind: "plan" as const,
				id: p.slug,
				title: p.title,
				subtitle: p.subtitle,
				image: p.image,
				tags: p.tags,
				likes: likes.get(`plan:${p.slug}`) ?? 0,
				url: `/meal-plans/${p.slug}`,
			})),
		[likes]
	);

	const recipeResults: SearchResult[] = useMemo(
		() =>
			allRecipes.map((r) => ({
				kind: "recipe" as const,
				id: r.id,
				title: r.name,
				subtitle: r.ingredients.slice(0, 3).join(", "),
				image: r.image,
				tags: r.tags,
				likes: likes.get(`recipe:${r.id}`) ?? 0,
				url: `/recipes/${r.id}`,
			})),
		[likes]
	);

	const results = useMemo(() => {
		const q = normalize(query);
		if (!q || q.length < 2) return { plans: [], recipes: [] };

		// For recipes we also search ingredient list
		const matchedRecipes = allRecipes
			.filter((r) => {
				const haystack = [
					r.name,
					...r.tags,
					...r.ingredients,
					r.mealType,
				].join(" ").toLowerCase();
				return haystack.includes(q);
			})
			.map((r) => {
				const res = recipeResults.find((rr) => rr.id === r.id)!;
				// Build subtitle from matching ingredients for ingredient searches
				const matchingIngredients = r.ingredients
					.filter((ing) => ing.toLowerCase().includes(q))
					.slice(0, 2);
				return {
					...res,
					subtitle: matchingIngredients.length > 0
						? matchingIngredients.join(", ")
						: res.subtitle,
					_score: score(res, q, likes),
				};
			})
			.filter((r) => r._score > 0 || allRecipes.find((ar) => ar.id === r.id)!.ingredients.some((ing) => ing.toLowerCase().includes(q)))
			.sort((a, b) => b._score - a._score)
			.slice(0, 8);

		const matchedPlans = planResults
			.filter((p) => {
				const plan = mealPlans.find((m) => m.slug === p.id)!;
				const haystack = [
					plan.title,
					plan.subtitle,
					plan.intro,
					...plan.tags,
					...plan.keyIngredients,
					...plan.recipes.flatMap((r) => r.ingredients),
				].join(" ").toLowerCase();
				return haystack.includes(q);
			})
			.map((p) => ({ ...p, _score: score(p, q, likes) }))
			.sort((a, b) => b._score - a._score)
			.slice(0, 5);

		return {
			plans: matchedPlans,
			recipes: matchedRecipes,
		};
	}, [query, planResults, recipeResults, likes]);

	return { query, setQuery, results, hasResults: results.plans.length > 0 || results.recipes.length > 0 };
}
