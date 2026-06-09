import { useState, useMemo, useEffect } from "react";
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
	const match = item.match(/^([½⅓⅔¼¾⅛⅜]|\d+(?:\.\d+)?)\s+(.*)/s);
	if (!match) return item;
	const rawQty = match[1];
	const rest = match[2].trim();
	const qty = rawQty in FRACTIONS ? FRACTIONS[rawQty] : parseFloat(rawQty);
	const scaled = qty * multiplier;
	const isWeight = WEIGHT_RE.test(rest);
	const display = isWeight
		? Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, "")
		: String(Math.ceil(scaled));
	return `${display} ${rest}`;
}

// Unique key for an item (category + original text)
function itemKey(category: string, item: string) {
	return `${category}||${item}`;
}

const MULTIPLIERS = [1, 1.5, 2, 3] as const;
type Multiplier = typeof MULTIPLIERS[number];

interface Props {
	items: ShoppingItem[];
	planTitle: string;
}

export default function ShoppingList({ items, planTitle }: Props) {
	const [multiplier, setMultiplier] = useState<Multiplier>(1);

	// All keys start checked (opt-out model)
	const allKeys = useMemo(
		() => new Set(items.flatMap((g) => g.items.map((item) => itemKey(g.category, item)))),
		[items]
	);
	const [checked, setChecked] = useState<Set<string>>(allKeys);

	// Reset checked when items change (new plan)
	useEffect(() => { setChecked(allKeys); }, [allKeys]);

	const [showShare, setShowShare] = useState(false);
	const [shareEmail, setShareEmail] = useState("");
	const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [shareError, setShareError] = useState("");

	function toggleItem(key: string) {
		setChecked((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	}

	function toggleCategory(category: string, categoryItems: string[]) {
		const keys = categoryItems.map((item) => itemKey(category, item));
		const allChecked = keys.every((k) => checked.has(k));
		setChecked((prev) => {
			const next = new Set(prev);
			keys.forEach((k) => (allChecked ? next.delete(k) : next.add(k)));
			return next;
		});
	}

	// Selected items with scaling applied, grouped by category
	const selectedSections = useMemo(() =>
		items
			.map((group) => ({
				category: group.category,
				items: group.items
					.filter((item) => checked.has(itemKey(group.category, item)))
					.map((item) => scaleItem(item, multiplier)),
			}))
			.filter((g) => g.items.length > 0),
		[items, checked, multiplier]
	);

	const selectedCount = checked.size;
	const totalCount = allKeys.size;

	// Plain text for native share
	function buildPlainText() {
		const header = `Shopping List — ${planTitle}${multiplier !== 1 ? ` (${multiplier}×)` : ""}\n\n`;
		return header + selectedSections
			.map((s) => `${s.category.toUpperCase()}\n${s.items.map((i) => `• ${i}`).join("\n")}`)
			.join("\n\n");
	}

	async function handleNativeShare() {
		try {
			await navigator.share({ title: `Shopping list: ${planTitle}`, text: buildPlainText() });
		} catch {
			// User cancelled or API unavailable — fall through silently
		}
	}

	async function handleEmailShare(e: React.FormEvent) {
		e.preventDefault();
		setShareStatus("loading");
		setShareError("");
		try {
			const res = await fetch("/api/share-list", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					to: shareEmail.trim(),
					planTitle,
					multiplier,
					sections: selectedSections,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			setShareStatus("success");
		} catch (err) {
			setShareError(err instanceof Error ? err.message : "Something went wrong");
			setShareStatus("error");
		}
	}

	const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

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
			</div>

			{/* Shopping list grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{items.map((group) => {
					const groupKeys = group.items.map((item) => itemKey(group.category, item));
					const allGroupChecked = groupKeys.every((k) => checked.has(k));
					return (
						<div key={group.category} className="bg-white rounded-xl border border-gray-100 p-4">
							<h4
								className="font-semibold text-[#1f2937] mb-3 flex items-center gap-2 cursor-pointer select-none"
								onClick={() => toggleCategory(group.category, group.items)}
							>
								<span
									className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
										allGroupChecked
											? "bg-[#e07030] border-[#e07030] text-white"
											: "border-gray-300"
									}`}
								>
									{allGroupChecked && "✓"}
								</span>
								<span aria-hidden="true">{categoryIcon[group.category]}</span>
								{group.category}
							</h4>
							<ul className="space-y-2">
								{group.items.map((item) => {
									const key = itemKey(group.category, item);
									const isChecked = checked.has(key);
									return (
										<li
											key={item}
											className="flex items-center gap-2 text-sm cursor-pointer select-none"
											onClick={() => toggleItem(key)}
										>
											<span
												className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
													isChecked
														? "bg-[#e07030] border-[#e07030] text-white"
														: "border-gray-300"
												}`}
											>
												{isChecked && "✓"}
											</span>
											<span className={isChecked ? "text-gray-700" : "text-gray-300 line-through"}>
												{scaleItem(item, multiplier)}
											</span>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</div>

			{/* Sticky share bar */}
			<div className="sticky bottom-4 mt-6">
				<div className="bg-[#1f2937] text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl max-w-2xl mx-auto">
					<span className="text-sm">
						<span className="font-black text-[#e07030]">{selectedCount}</span>
						<span className="text-gray-300"> / {totalCount} items selected</span>
					</span>
					<button
						onClick={() => setShowShare(true)}
						disabled={selectedCount === 0}
						className="bg-[#e07030] hover:bg-[#c05a20] disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
					>
						Share List →
					</button>
				</div>
			</div>

			{/* Share modal */}
			{showShare && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowShare(false); setShareStatus("idle"); }} />
					<div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-lg font-black text-[#1f2937]">Share Shopping List</h3>
								<button onClick={() => { setShowShare(false); setShareStatus("idle"); }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
							</div>

							{/* Preview of selected items */}
							<div className="bg-[#faf8f4] rounded-2xl p-4 mb-5 max-h-52 overflow-y-auto space-y-3">
								{selectedSections.map((s) => (
									<div key={s.category}>
										<p className="text-xs font-bold text-[#e07030] uppercase tracking-widest mb-1">{s.category}</p>
										<ul className="space-y-0.5">
											{s.items.map((item) => (
												<li key={item} className="text-sm text-gray-700">• {item}</li>
											))}
										</ul>
									</div>
								))}
							</div>

							{shareStatus === "success" ? (
								<div className="text-center py-4">
									<div className="text-3xl mb-2">✅</div>
									<p className="font-black text-[#1f2937]">List sent!</p>
									<p className="text-sm text-gray-500 mt-1">Check your inbox.</p>
									<button onClick={() => { setShowShare(false); setShareStatus("idle"); setShareEmail(""); }} className="mt-4 text-[#e07030] font-bold text-sm hover:underline">Close</button>
								</div>
							) : (
								<>
									{/* Email form */}
									<form onSubmit={handleEmailShare} className="space-y-3">
										<label className="block text-sm font-semibold text-gray-700">Send to email</label>
										<input
											type="email"
											value={shareEmail}
											onChange={(e) => setShareEmail(e.target.value)}
											placeholder="your@email.com"
											required
											disabled={shareStatus === "loading"}
											className="w-full border-2 border-gray-200 focus:border-[#e07030] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors disabled:opacity-60"
										/>
										{shareStatus === "error" && (
											<p className="text-red-500 text-xs">{shareError}</p>
										)}
										<button
											type="submit"
											disabled={shareStatus === "loading"}
											className="w-full bg-[#e07030] hover:bg-[#c05a20] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
										>
											{shareStatus === "loading" ? (
												<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</>
											) : "Send to my inbox"}
										</button>
									</form>

									{/* Native share (mobile) */}
									{canNativeShare && (
										<>
											<div className="flex items-center gap-3 my-4">
												<div className="flex-1 h-px bg-gray-200" />
												<span className="text-xs text-gray-400">or</span>
												<div className="flex-1 h-px bg-gray-200" />
											</div>
											<button
												onClick={handleNativeShare}
												className="w-full border-2 border-gray-200 hover:border-[#e07030] text-gray-700 hover:text-[#e07030] font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
											>
												📤 Share via…
											</button>
										</>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
