import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navLinks = [
	{ to: "/meal-plans", label: "Meal Plans" },
	{ to: "/recipes", label: "Recipe Library" },
	{ to: "/about", label: "About" },
];

export default function Navbar() {
	const location = useLocation();
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Top bar */}
			<div className="bg-[#1f2937] text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
				New meal plan every Monday — <Link to="/contact" className="underline hover:text-[#e07030] transition-colors">subscribe free →</Link>
			</div>

			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
				<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

					{/* Logo */}
					<Link to="/" className="flex-shrink-0 flex flex-col leading-none">
						<span className="font-black text-lg text-[#1f2937] tracking-tight">WEEK ON WEEK OFF</span>
						<span className="text-[#e07030] font-semibold text-xs uppercase tracking-widest -mt-0.5">Kitchen</span>
					</Link>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									location.pathname === link.to
										? "bg-[#faf8f4] text-[#e07030]"
										: "text-gray-600 hover:bg-[#faf8f4] hover:text-[#1f2937]"
								}`}
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* Right side */}
					<div className="hidden md:flex items-center gap-3">
						<Link
							to="/contact"
							className="bg-[#e07030] hover:bg-[#c05a20] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors shadow-sm"
						>
							Get Free Plans
						</Link>
					</div>

					{/* Mobile hamburger */}
					<button
						className="md:hidden p-2 text-gray-600 ml-auto"
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
					<div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
						<Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-[#faf8f4]">Home</Link>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								onClick={() => setOpen(false)}
								className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-[#faf8f4]"
							>
								{link.label}
							</Link>
						))}
						<div className="pt-2">
							<Link
								to="/contact"
								onClick={() => setOpen(false)}
								className="block w-full text-center bg-[#e07030] text-white font-bold px-4 py-3 rounded-full text-sm"
							>
								Get Free Plans
							</Link>
						</div>
					</div>
				)}
			</nav>
		</>
	);
}
