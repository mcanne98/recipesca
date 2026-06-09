import type { Tag } from "../data/types";

const tagStyles: Record<Tag, string> = {
	"High Protein": "bg-[#e07030] text-white",
	"Budget Friendly": "bg-[#7a9e7e] text-white",
	"Kid Approved": "bg-yellow-400 text-[#1f2937]",
	"Freezer Friendly": "bg-blue-500 text-white",
	"Vegetarian": "bg-green-500 text-white",
	"Quick Prep": "bg-purple-500 text-white",
};

export default function TagBadge({ tag }: { tag: Tag }) {
	return (
		<span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${tagStyles[tag]}`}>
			{tag}
		</span>
	);
}
