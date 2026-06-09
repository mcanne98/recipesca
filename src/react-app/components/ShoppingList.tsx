import { useState } from "react";
import type { ShoppingItem } from "../data/types";

const categoryIcon: Record<string, string> = {
	Produce: "🥦",
	Protein: "🥩",
	Dairy: "🧀",
	Pantry: "🫙",
	Frozen: "🧊",
	Snacks: "🍎",
	Other: "🛒",
};

// Unicode fraction map
const FRACTIONS: Record<string, number> = {
	"½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3,
	"¼": 0.25, "¾": 0.75, "⅛": 0.125, "⅜": 0.375,
};

const WEIGHT_RE = /^lbs?|^oz/i;

function scaleItem(item: string, multiplier: number): string {
	if (multiplier === 1) return item;

	// Match a leading quantity: unicode fraction OR decimal/integer
	const match = item.match(/^([½⅓⅔¼¾⅛⅜]|\d+(?:\.\d+)?)\s+(.*)/s);
	if (!match) return item; // no leading number — return as-is

	const rawQty = match[1];
	const rest = match[2].trim();

	const qty = rawQty in FRACTIONS ? FRACTIONS[rawQty] : parseFloat(rawQty);
	const scaled = qty * multiplier;

	// Is the first word of `rest` a weight unit?
	const isWeight = WEIGHT_RE.test(rest);

	let display: string;
	if (isWeight) {
		// Actual decimal weight, trimmed to 1 decimal place
		display = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, "");
	} else {
		// Count item — round up to whole unit
		display = String(Math.ceil(scaled));
	}

	return `${display} ${rest}`;
}

const MULTIPLIERS = [1, 1.5, 2, 3] as const;
type Multiplier = typeof MULTIPLIERS[number];

export default function ShoppingList({ items }: { items: ShoppingItem[] }) {
	const [multiplier, setMultiplier] = useState<Multiplier>(1);

	return (
		<div>
			{/* Multiplier selector */}
			<div className="flex items-center gap-3 mb-6 flex-wrap">
				<span className="text-sm font-semibold text-gray-600">Serving size:</span>
				<div className="flex gap-2">
					{MULTIPLIERS.map((m) => (
						<button
							key={m}
							onClick={() => setMultiplier(m)}
							className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${
								multiplier === m
									? "bg-[#e07030] text-white border-[#e07030]"
									: "bg-white text-gray-600 border-gray-200 hover:border-[#e07030] hover:text-[#e07030]"
							}`}
						>
							{m === 1 ? "1× (default)" : `${m}×`}
						</button>
					))}
				</div>
				{multiplier !== 1 && (
					<span className="text-xs text-gray-400 italic">
						Quantities scaled for {multiplier === 1.5 ? "bigger appetites" : multiplier === 2 ? "double portions" : "triple portions"}
					</span>
				)}
			</div>

			{/* Shopping list grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{items.map((group) => (
					<div key={group.category} className="bg-white rounded-xl border border-gray-100 p-4">
						<h4 className="font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
							<span aria-hidden="true">{categoryIcon[group.category]}</span>
							{group.category}
						</h4>
						<ul className="space-y-2">
							{group.items.map((item, i) => (
								<li key={i} className="flex items-center gap-2 text-sm text-gray-600">
									<span className="w-4 h-4 rounded border border-gray-300 flex-shrink-0 inline-block" aria-hidden="true" />
									{scaleItem(item, multiplier)}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
