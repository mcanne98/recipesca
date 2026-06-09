import type { DayMeals } from "../data/types";

export default function MealPlanTable({ days }: { days: DayMeals[] }) {
	return (
		<div className="overflow-x-auto rounded-xl border border-gray-100">
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="bg-[#1f2937] text-white">
						<th className="text-left p-3 font-semibold">Day</th>
						<th className="text-left p-3 font-semibold">Breakfast</th>
						<th className="text-left p-3 font-semibold">Lunch</th>
						<th className="text-left p-3 font-semibold">Dinner</th>
						<th className="text-left p-3 font-semibold">Snack</th>
					</tr>
				</thead>
				<tbody>
					{days.map((day, i) => (
						<tr key={day.day} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f4]"}>
							<td className="p-3 font-semibold text-[#e07030] whitespace-nowrap">{day.day}</td>
							<td className="p-3 text-gray-700">{day.breakfast}</td>
							<td className="p-3 text-gray-700">{day.lunch}</td>
							<td className="p-3 text-gray-700">{day.dinner}</td>
							<td className="p-3 text-gray-500 italic">{day.snack ?? "—"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
