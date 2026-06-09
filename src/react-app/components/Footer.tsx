import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="bg-[#1f2937] text-gray-400 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
					<div>
						<div className="font-bold text-white text-lg mb-2">
							<span className="text-[#e07030]">Week On</span> Week Off Kitchen
						</div>
						<p className="text-sm">
							Real food for real parenting weeks. One prep session, seven days of meals.
						</p>
					</div>
					<div>
						<h4 className="text-white font-semibold mb-3">Quick Links</h4>
						<ul className="space-y-2 text-sm">
							<li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
							<li><Link to="/meal-plans" className="hover:text-white transition-colors">Meal Plans</Link></li>
							<li><Link to="/recipes" className="hover:text-white transition-colors">Recipe Library</Link></li>
							<li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
						</ul>
					</div>
					<div>
						<h4 className="text-white font-semibold mb-3">The Idea</h4>
						<p className="text-sm">
							A dad cooking real meals for three kids during his parenting week. No takeout. No meal kits. Just good food, planned ahead.
						</p>
					</div>
				</div>
				<div className="border-t border-gray-700 pt-6 text-xs text-center">
					<p>© {new Date().getFullYear()} Week On Week Off Kitchen. Made with love for the kids.</p>
				</div>
			</div>
		</footer>
	);
}
