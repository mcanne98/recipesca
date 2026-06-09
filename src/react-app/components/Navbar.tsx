import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navLinks = [
	{ to: "/", label: "Home" },
	{ to: "/meal-plans", label: "Meal Plans" },
	{ to: "/recipes", label: "Recipes" },
	{ to: "/about", label: "About" },
];

export default function Navbar() {
	const location = useLocation();
	const [open, setOpen] = useState(false);

	return (
		<nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
			<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
				<Link to="/" className="font-bold text-xl text-[#1f2937]">
					<span className="text-[#e07030]">Week On</span> Week Off Kitchen
				</Link>

				{/* Desktop nav */}
				<div className="hidden md:flex items-center gap-6">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`text-sm font-medium transition-colors ${
								location.pathname === link.to
									? "text-[#e07030]"
									: "text-gray-600 hover:text-[#e07030]"
							}`}
						>
							{link.label}
						</Link>
					))}
					<Link
						to="/contact"
						className="bg-[#e07030] hover:bg-[#c05a20] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
					>
						Subscribe
					</Link>
				</div>

				{/* Mobile hamburger */}
				<button
					className="md:hidden p-2 text-gray-600"
					onClick={() => setOpen(!open)}
					aria-label="Toggle navigation menu"
				>
					{open ? (
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					) : (
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					)}
				</button>
			</div>

			{/* Mobile menu */}
			{open && (
				<div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							onClick={() => setOpen(false)}
							className="block text-sm font-medium text-gray-600 hover:text-[#e07030] py-1"
						>
							{link.label}
						</Link>
					))}
					<Link
						to="/contact"
						onClick={() => setOpen(false)}
						className="block text-sm font-semibold text-[#e07030] py-1"
					>
						Subscribe
					</Link>
				</div>
			)}
		</nav>
	);
}
