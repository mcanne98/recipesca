import { useParams, Link } from "react-router-dom";
import { findRecipeById } from "../data/allRecipes";
import TagBadge from "../components/TagBadge";

const mealTypeLabel: Record<string, string> = {
	breakfast: "☀️ Breakfast",
	lunch: "🥗 Lunch",
	dinner: "🍽️ Dinner",
	snack: "🍎 Snack",
};

function formatTime(minutes: number): string {
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

// Detect section headers in the Quiche-style "HEADER: text" pattern
function isSectionHeader(step: string): boolean {
	return /^[A-Z ]+:/.test(step);
}

export default function RecipeDetail() {
	const { id } = useParams<{ id: string }>();
	const recipe = findRecipeById(id ?? "");

	if (!recipe) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-24 text-center">
				<h1 className="text-2xl font-bold text-[#1f2937] mb-4">Recipe not found</h1>
				<Link to="/recipes" className="text-[#e07030] hover:underline">
					← Back to Recipe Library
				</Link>
			</div>
		);
	}

	const totalTime = recipe.prepTime + recipe.cookTime;

	// Separate section-header steps from numbered steps
	let stepNumber = 0;

	// Detect ingredient section headers (lines starting with "—")
	const isIngredientHeader = (line: string) => line.startsWith("—");

	return (
		<>
			{/* Hero */}
			<div className="relative w-full bg-[#1f2937]" style={{ minHeight: "320px" }}>
				{recipe.image ? (
					<>
						<img
							src={recipe.image}
							alt={recipe.name}
							className="w-full object-cover"
							style={{ maxHeight: "480px", width: "100%", objectPosition: "center" }}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#1f2937]/90 via-[#1f2937]/30 to-transparent" />
					</>
				) : (
					<div className="absolute inset-0 bg-[#1f2937]" />
				)}
				<div className="absolute bottom-0 left-0 right-0 px-4 py-8 max-w-4xl mx-auto">
					<Link to="/recipes" className="text-gray-300 hover:text-white text-sm mb-4 inline-block transition-colors">
						← Recipe Library
					</Link>
					<div className="flex flex-wrap gap-2 mb-3">
						<span className="bg-[#e07030]/90 text-white text-xs font-bold px-3 py-1 rounded-full">
							{mealTypeLabel[recipe.mealType]}
						</span>
						{recipe.tags.map((tag) => (
							<TagBadge key={tag} tag={tag} />
						))}
					</div>
					<h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{recipe.name}</h1>
					<div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
						<span>⏱ Prep: {formatTime(recipe.prepTime)}</span>
						<span>🔥 Cook: {formatTime(recipe.cookTime)}</span>
						<span>⏰ Total: {formatTime(totalTime)}</span>
						<span>🍽️ Serves: {recipe.servings}</span>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="max-w-4xl mx-auto px-4 py-10">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-8">

					{/* Ingredients — narrower column on desktop */}
					<div className="md:col-span-2">
						<div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
							<h2 className="text-xl font-black text-[#1f2937] mb-4">Ingredients</h2>
							<ul className="space-y-2">
								{recipe.ingredients.map((ing, i) => (
									isIngredientHeader(ing) ? (
										<li key={i} className="pt-3 first:pt-0">
											<span className="text-xs font-bold text-[#e07030] uppercase tracking-widest">
												{ing.replace(/^—\s*/, "").replace(/\s*—$/, "")}
											</span>
										</li>
									) : (
										<li key={i} className="flex items-start gap-2 text-sm text-gray-700">
											<span className="text-[#e07030] mt-0.5 flex-shrink-0">•</span>
											<span>{ing}</span>
										</li>
									)
								))}
							</ul>
						</div>
					</div>

					{/* Instructions — wider column */}
					<div className="md:col-span-3">
						<h2 className="text-xl font-black text-[#1f2937] mb-5">Instructions</h2>
						<ol className="space-y-5">
							{recipe.instructions.map((step, i) => {
								if (isSectionHeader(step)) {
									stepNumber = 0;
									const [header, ...rest] = step.split(/:\s+/);
									return (
										<li key={i}>
											<p className="text-xs font-bold text-[#e07030] uppercase tracking-widest mb-2">{header}</p>
											{rest.length > 0 && (
												<div className="flex items-start gap-3">
													<span className="w-7 h-7 rounded-full bg-[#e07030] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
														{++stepNumber}
													</span>
													<p className="text-gray-700 text-sm leading-relaxed pt-0.5">{rest.join(": ")}</p>
												</div>
											)}
										</li>
									);
								}
								return (
									<li key={i} className="flex items-start gap-3">
										<span className="w-7 h-7 rounded-full bg-[#e07030] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
											{++stepNumber}
										</span>
										<p className="text-gray-700 text-sm leading-relaxed pt-0.5">{step}</p>
									</li>
								);
							})}
						</ol>

						{/* Storage + Kid tip */}
						<div className="mt-10 space-y-4">
							{recipe.storageNotes && (
								<div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900">
									<span className="font-bold">🧊 Storage:</span> {recipe.storageNotes}
								</div>
							)}
							{recipe.kidTip && (
								<div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-sm text-yellow-800">
									<span className="font-bold">👧 Kid Tip:</span> {recipe.kidTip}
								</div>
							)}
							{recipe.reheatingNotes && (
								<div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-900">
									<span className="font-bold">♨️ Reheating:</span> {recipe.reheatingNotes}
								</div>
							)}
							{recipe.substitutions && recipe.substitutions.length > 0 && (
								<div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-900">
									<p className="font-bold mb-2">🔄 Substitutions</p>
									<ul className="space-y-1">
										{recipe.substitutions.map((s, i) => (
											<li key={i} className="flex items-start gap-2">
												<span className="text-green-600 flex-shrink-0">•</span>
												<span>{s}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Back link */}
				<div className="mt-12 pt-8 border-t border-gray-100">
					<Link to="/recipes" className="text-[#e07030] hover:underline font-semibold text-sm">
						← Back to Recipe Library
					</Link>
				</div>
			</div>
		</>
	);
}
