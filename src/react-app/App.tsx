import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MealPlans from "./pages/MealPlans";
import MealPlanDetail from "./pages/MealPlanDetail";
import RecipeLibrary from "./pages/RecipeLibrary";
import About from "./pages/About";
import Contact from "./pages/Contact";
import "./index.css";

export default function App() {
	return (
		<HashRouter>
			<div className="flex flex-col min-h-screen bg-[#faf8f4]">
				<Navbar />
				<main className="flex-1">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/meal-plans" element={<MealPlans />} />
						<Route path="/meal-plans/:slug" element={<MealPlanDetail />} />
						<Route path="/recipes" element={<RecipeLibrary />} />
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</HashRouter>
	);
}
