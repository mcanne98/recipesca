import type { PrepStep } from "../data/types";

export default function PrepSchedule({ steps }: { steps: PrepStep[] }) {
	return (
		<div className="space-y-0">
			{steps.map((step, i) => (
				<div key={i} className="flex gap-4">
					<div className="flex flex-col items-center">
						<div className="w-8 h-8 rounded-full bg-[#e07030] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
							{i + 1}
						</div>
						{i < steps.length - 1 && (
							<div className="w-0.5 bg-gray-200 flex-1 my-1" style={{ minHeight: "1.5rem" }} />
						)}
					</div>
					<div className="pb-6">
						<div className="text-xs font-semibold text-[#e07030] mb-0.5">{step.timeRange}</div>
						<div className="font-semibold text-[#1f2937] mb-1">{step.task}</div>
						{step.details && (
							<p className="text-sm text-gray-600 leading-relaxed">{step.details}</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
