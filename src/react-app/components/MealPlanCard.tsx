import { Link } from "react-router-dom";
import type { MealPlan } from "../data/types";
import TagBadge from "./TagBadge";

// Warm gradient "food photo" backgrounds for each card
const cardGradients = [
	"from-[#e07030] via-[#f09040] to-[#f5b86e]",
	"from-[#5c7d60] via-[#7a9e7e] to-[#a5c8a8]",
	"from-[#b85c20] via-[#d4752e] to-[#e8a060]",
	"from-[#3d6b8a] via-[#5a8fa8] to-[#82b4cc]",
];

const cardEmojis = ["🍗", "🥦", "🍝", "🥘"];

interface Props {
	plan: MealPlan;
	index?: number;
	variant?: "default" | "featured";
}

export default function MealPlanCard({ plan, index = 0, variant = "default" }: Props) {
	const gradient = cardGradients[index % cardGradients.length];
	const emoji = cardEmojis[index % cardEmojis.length];
	const date = new Date(plan.publishedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	if (variant === "featured") {
		return (
			<Link to={`/meal-plans/${plan.slug}`} className="block group">
				<div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col md:flex-row">
					{/* Image area */}
					<div className="md:w-2/5 flex-shrink-0 relative overflow-hidden">
						{plan.image ? (
							<img src={plan.image} alt={plan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ minHeight: "200px" }} />
						) : (
							<div className={`bg-gradient-to-br ${gradient} w-full h-full flex items-center justify-center py-16 md:py-0 relative`}>
								<div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
								<span className="text-8xl drop-shadow-md relative z-10">{emoji}</span>
							</div>
						)}
					</div>
					{/* Content */}
					<div className="p-8 flex flex-col justify-center">
						<span className="text-xs text-[#e07030] font-bold uppercase tracking-widest mb-3">{date}</span>
						<h3 className="text-2xl font-black text-[#1f2937] mb-2 group-hover:text-[#e07030] transition-colors leading-tight">
							{plan.title}
						</h3>
						<p className="text-gray-500 text-sm mb-5 leading-relaxed">{plan.intro.slice(0, 120)}…</p>
						<div className="flex flex-wrap gap-2 mb-5">
							{plan.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
						</div>
						<div className="flex gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
							<span><strong className="text-[#1f2937]">⏱ {plan.prepTime}</strong></span>
							<span><strong className="text-[#1f2937]">🍽 {plan.mealCount} meals</strong></span>
						</div>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link to={`/meal-plans/${plan.slug}`} className="block group">
			<div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100">
				{/* Image area */}
				<div className="aspect-[16/9] relative overflow-hidden">
					{plan.image ? (
						<img
							src={plan.image}
							alt={`Key ingredients for ${plan.title}`}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
					) : (
						<div className={`bg-gradient-to-br ${gradient} w-full h-full flex items-center justify-center relative`}>
							<div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 75%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
							<span className="text-7xl drop-shadow-md relative z-10">{emoji}</span>
						</div>
					)}
					{/* Prep time badge */}
					<div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1f2937] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
						⏱ {plan.prepTime}
					</div>
				</div>

				{/* Content */}
				<div className="p-5 flex flex-col flex-1">
					<span className="text-xs text-[#e07030] font-bold uppercase tracking-widest mb-1.5">{date}</span>
					<h3 className="text-lg font-black text-[#1f2937] mb-1.5 group-hover:text-[#e07030] transition-colors leading-snug">
						{plan.title}
					</h3>
					<p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{plan.subtitle}</p>

					<div className="flex flex-wrap gap-1.5 mb-4">
						{plan.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
					</div>

					<div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
						<span><strong className="text-[#1f2937]">Meals:</strong> {plan.mealCount}</span>
						<span><strong className="text-[#1f2937]">Family:</strong> {plan.familySize}</span>
						<span className="col-span-2">
							<strong className="text-[#1f2937]">Includes:</strong> {plan.keyIngredients.slice(0, 3).join(", ")}
						</span>
					</div>

					<div className="mt-4">
						<span className="text-[#e07030] font-bold text-sm group-hover:underline">
							View full plan →
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
