import { useState, useRef, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import type { Nutrition } from "../data/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const MACRO_COLORS = {
	protein: "#e07030",
	carbs: "#4f8ef7",
	fat: "#f5b942",
};

interface Props {
	nutrition: Nutrition;
	baseServings: number;
}

function round1(n: number) {
	return Math.round(n * 10) / 10;
}

export default function NutritionPanel({ nutrition, baseServings }: Props) {
	const [servings, setServings] = useState(baseServings);
	const [perServing, setPerServing] = useState(true);
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	// Reset when recipe changes
	useEffect(() => {
		setServings(baseServings);
		setPerServing(true);
	}, [baseServings]);

	// Per-serving values already stored; scale by serving count for entire recipe

	// Nutrition per 1 serving × (servings / baseServings) when viewing entire recipe
	// The stored values are already per-serving for baseServings
	// When user changes servings: per-serving stays the same (divide total by new servings = same per serving)
	// For entire recipe: multiply per-serving by new serving count
	const n = {
		calories: Math.round(nutrition.calories * (perServing ? 1 : servings)),
		protein: round1(nutrition.protein * (perServing ? 1 : servings)),
		carbs: round1(nutrition.carbs * (perServing ? 1 : servings)),
		fat: round1(nutrition.fat * (perServing ? 1 : servings)),
		fiber: round1(nutrition.fiber * (perServing ? 1 : servings)),
		sugar: round1(nutrition.sugar * (perServing ? 1 : servings)),
		saturatedFat: round1(nutrition.saturatedFat * (perServing ? 1 : servings)),
		sodium: Math.round(nutrition.sodium * (perServing ? 1 : servings)),
		cholesterol: Math.round(nutrition.cholesterol * (perServing ? 1 : servings)),
	};

	// Macro-derived calories for chart
	const proteinCal = n.protein * 4;
	const carbsCal = n.carbs * 4;
	const fatCal = n.fat * 9;
	const totalMacroCal = proteinCal + carbsCal + fatCal || 1;

	const chartData = {
		labels: ["Protein", "Carbs", "Fat"],
		datasets: [
			{
				data: [
					Math.round((proteinCal / totalMacroCal) * 100),
					Math.round((carbsCal / totalMacroCal) * 100),
					Math.round((fatCal / totalMacroCal) * 100),
				],
				backgroundColor: [MACRO_COLORS.protein, MACRO_COLORS.carbs, MACRO_COLORS.fat],
				borderWidth: 0,
				hoverOffset: 4,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		cutout: "68%",
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: { parsed: number }) => ` ${ctx.parsed}% of calories`,
				},
			},
		},
	};

	return (
		<div ref={panelRef} className="mt-10 mb-8">
			{/* Header row */}
			<div className="flex flex-wrap items-center justify-between gap-3 mb-5">
				<h2 className="text-xl font-black text-[#1f2937]">Nutrition & Macros</h2>
				<div className="flex items-center gap-3 flex-wrap">
					{/* Serving toggle */}
					<div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 text-sm font-semibold">
						<button
							onClick={() => setPerServing(true)}
							className={`px-3 py-1 rounded-lg transition-all ${perServing ? "bg-white shadow text-[#e07030]" : "text-gray-500"}`}
						>
							Per Serving
						</button>
						<button
							onClick={() => setPerServing(false)}
							className={`px-3 py-1 rounded-lg transition-all ${!perServing ? "bg-white shadow text-[#e07030]" : "text-gray-500"}`}
						>
							Entire Recipe
						</button>
					</div>
					{/* Servings adjuster */}
					<div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 text-sm">
						<span className="text-gray-500 font-medium">Servings:</span>
						<button
							onClick={() => setServings((s) => Math.max(1, s - 1))}
							className="w-6 h-6 rounded-full bg-white shadow text-[#e07030] font-bold hover:bg-[#e07030] hover:text-white transition-colors flex items-center justify-center"
							aria-label="Decrease servings"
						>
							−
						</button>
						<span className="w-5 text-center font-bold text-[#1f2937]">{servings}</span>
						<button
							onClick={() => setServings((s) => s + 1)}
							className="w-6 h-6 rounded-full bg-white shadow text-[#e07030] font-bold hover:bg-[#e07030] hover:text-white transition-colors flex items-center justify-center"
							aria-label="Increase servings"
						>
							+
						</button>
					</div>
				</div>
			</div>

			{/* Primary macro cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
				<MacroCard label="Calories" value={n.calories} unit="kcal" color="#e07030" icon="🔥" />
				<MacroCard label="Protein" value={n.protein} unit="g" color={MACRO_COLORS.protein} icon="💪" />
				<MacroCard label="Carbs" value={n.carbs} unit="g" color={MACRO_COLORS.carbs} icon="🌾" />
				<MacroCard label="Fat" value={n.fat} unit="g" color={MACRO_COLORS.fat} icon="🫒" />
			</div>

			{/* Chart + secondary stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{/* Doughnut chart */}
				<div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center">
					<p className="text-sm font-bold text-[#1f2937] mb-3">Calorie Distribution</p>
					<div className="w-36 h-36" role="img" aria-label={`Macro distribution: ${chartData.datasets[0].data[0]}% protein, ${chartData.datasets[0].data[1]}% carbs, ${chartData.datasets[0].data[2]}% fat`}>
						<Doughnut data={chartData} options={chartOptions} />
					</div>
					<div className="flex gap-4 mt-4 text-xs font-semibold">
						<LegendDot color={MACRO_COLORS.protein} label={`Protein ${chartData.datasets[0].data[0]}%`} />
						<LegendDot color={MACRO_COLORS.carbs} label={`Carbs ${chartData.datasets[0].data[1]}%`} />
						<LegendDot color={MACRO_COLORS.fat} label={`Fat ${chartData.datasets[0].data[2]}%`} />
					</div>
				</div>

				{/* Secondary stats */}
				<div className="bg-white rounded-2xl border border-gray-100 p-5">
					<p className="text-sm font-bold text-[#1f2937] mb-3">Additional Nutrition</p>
					<dl className="space-y-2">
						<StatRow label="Fiber" value={`${n.fiber} g`} />
						<StatRow label="Sugar" value={`${n.sugar} g`} />
						<StatRow label="Saturated Fat" value={`${n.saturatedFat} g`} />
						<StatRow label="Sodium" value={`${n.sodium} mg`} />
						<StatRow label="Cholesterol" value={`${n.cholesterol} mg`} />
					</dl>
				</div>
			</div>

			{/* Disclaimer */}
			<p className="mt-3 text-xs text-gray-400 text-center">
				{perServing ? "Per serving" : `Entire recipe (${servings} servings)`} · Estimated based on USDA food composition data. Actual values may vary depending on brands, preparation methods, and serving sizes.
			</p>

			{/* Understanding Your Macros */}
			<div className="mt-5 border border-gray-100 rounded-2xl overflow-hidden">
				<button
					onClick={() => setOpen((o) => !o)}
					className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-[#1f2937] bg-gray-50 hover:bg-gray-100 transition-colors"
					aria-expanded={open}
				>
					<span>Understanding Your Macros</span>
					<span className="text-gray-400 text-base">{open ? "▲" : "▼"}</span>
				</button>
				{open && (
					<div className="px-5 py-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
						<MacroExplainer icon="💪" color={MACRO_COLORS.protein} label="Protein" desc="Supports muscle repair, growth, and maintenance. Essential for recovery after exercise and daily cellular function." />
						<MacroExplainer icon="🌾" color={MACRO_COLORS.carbs} label="Carbohydrates" desc="Provide energy for daily activities and exercise. The body's preferred fuel source for the brain and muscles." />
						<MacroExplainer icon="🫒" color={MACRO_COLORS.fat} label="Fat" desc="Supports essential bodily functions and nutrient absorption. Necessary for hormones, brain health, and fat-soluble vitamins." />
						<MacroExplainer icon="🥦" color="#16a34a" label="Fiber" desc="Contributes to digestive health, helps regulate blood sugar, and supports a healthy gut microbiome." />
					</div>
				)}
			</div>
		</div>
	);
}

function MacroCard({ label, value, unit, color, icon }: { label: string; value: number; unit: string; color: string; icon: string }) {
	return (
		<div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center shadow-sm">
			<span className="text-2xl mb-1">{icon}</span>
			<span className="text-2xl font-black" style={{ color }}>{value}</span>
			<span className="text-xs text-gray-400 font-medium">{unit}</span>
			<span className="text-xs font-bold text-[#1f2937] mt-1">{label}</span>
		</div>
	);
}

function StatRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between items-center text-sm border-b border-gray-50 pb-1.5">
			<dt className="text-gray-500">{label}</dt>
			<dd className="font-semibold text-[#1f2937]">{value}</dd>
		</div>
	);
}

function LegendDot({ color, label }: { color: string; label: string }) {
	return (
		<span className="flex items-center gap-1">
			<span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
			{label}
		</span>
	);
}

function MacroExplainer({ icon, color, label, desc }: { icon: string; color: string; label: string; desc: string }) {
	return (
		<div className="flex gap-3">
			<span className="text-xl flex-shrink-0">{icon}</span>
			<div>
				<p className="font-bold" style={{ color }}>{label}</p>
				<p className="text-gray-600 text-xs leading-relaxed mt-0.5">{desc}</p>
			</div>
		</div>
	);
}
