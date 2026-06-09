import { Link } from "react-router-dom";

const principles = [
	{
		title: "Real ingredients",
		desc: "Nothing from a box that I couldn't explain to a 7-year-old. Chicken, rice, vegetables, eggs.",
	},
	{
		title: "Kid-tested, dad-approved",
		desc: "If my kids won't eat it twice, it doesn't make the plan. I've earned every recipe on this site.",
	},
	{
		title: "Efficient, not perfect",
		desc: "The goal is not gourmet. The goal is nutritious, tasty, on the table before 7pm.",
	},
	{
		title: "Less stress, more presence",
		desc: "When the food is handled, I can actually be present at dinner instead of frantic in the kitchen.",
	},
];

export default function About() {
	return (
		<>
			<section className="bg-[#1f2937] text-white py-20 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">About This Kitchen</h1>
					<p className="text-gray-300 text-xl">A dad, three kids, and a commitment to real food.</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-4">How this started</h2>
					<div className="space-y-4 text-gray-700 leading-relaxed">
						<p>
							When I first started doing week-on/week-off parenting, I felt like I was constantly scrambling. The kids needed dinner, I was tired, and the easy answer was always takeout or frozen pizza.
						</p>
						<p>
							After a few months of that, I decided enough was enough. I wanted to feed my kids properly. Not instagram-perfect meals — just real food. Cooked by me. At a table together.
						</p>
						<p>
							I started batch cooking on Sundays. Slowly I got better at it. I figured out what could be prepped ahead, what kept well, what the kids would actually eat. I built systems. Then I started writing it all down.
						</p>
						<p>
							This site is that notebook, made public. Every plan here is something I've actually cooked for my family.
						</p>
					</div>
				</section>

				<section className="bg-[#faf8f4] rounded-2xl p-8">
					<h2 className="text-2xl font-bold text-[#1f2937] mb-6">The Week-On / Week-Off Setup</h2>
					<div className="space-y-4 text-gray-700 leading-relaxed">
						<p>
							If you're new to week-on/week-off parenting: it means your kids alternate weeks between two homes. One week they're with me, the next week they're with their mom.
						</p>
						<p>
							During "my week," I'm the only adult in the house. That means I'm handling three kids, school runs, homework, bedtime — and cooking every meal. There's no one to hand off to when I'm tired.
						</p>
						<p>
							That's exactly why Sunday prep matters so much. When Wednesday evening hits and everyone is hungry and cranky, I need to already have food ready. The prep was done Sunday. All I'm doing now is reheating and plating.
						</p>
					</div>
				</section>

				<section>
					<h2 className="text-2xl font-bold text-[#1f2937] mb-6">The principles I cook by</h2>
					<div className="space-y-5">
						{principles.map((item) => (
							<div key={item.title} className="flex gap-4">
								<div className="w-2 h-2 rounded-full bg-[#e07030] mt-2 flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-[#1f2937]">{item.title}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="text-center">
					<p className="text-gray-500 mb-6">Ready to try a meal plan?</p>
					<Link
						to="/meal-plans"
						className="inline-block bg-[#e07030] hover:bg-[#c05a20] text-white font-semibold px-8 py-3 rounded-full transition-colors"
					>
						Browse Meal Plans
					</Link>
				</section>
			</div>
		</>
	);
}
