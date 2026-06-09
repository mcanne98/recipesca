import { Link } from "react-router-dom";

export default function SubscribeCTA() {
	return (
		<section className="bg-[#1f2937] text-white py-16 px-4">
			<div className="max-w-2xl mx-auto text-center">
				<h2 className="text-3xl font-bold mb-3">Get the next meal plan in your inbox</h2>
				<p className="text-gray-300 mb-8">
					New weekly plans every Monday. No fluff, no filler — just a week of real meals, a shopping list, and a prep schedule.
				</p>
				<Link
					to="/contact"
					className="inline-block bg-[#e07030] hover:bg-[#c05a20] text-white font-semibold px-8 py-3 rounded-full transition-colors"
				>
					Subscribe — it's free
				</Link>
			</div>
		</section>
	);
}
