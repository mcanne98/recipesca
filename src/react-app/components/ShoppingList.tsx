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

export default function ShoppingList({ items }: { items: ShoppingItem[] }) {
	return (
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
								{item}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}
