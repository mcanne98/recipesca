import { useEffect, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import type { SearchResult } from "../hooks/useSearch";

interface Props {
	onClose: () => void;
}

export default function SearchModal({ onClose }: Props) {
	const { query, setQuery, results, hasResults } = useSearch();
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const flatResults: SearchResult[] = [...results.plans, ...results.recipes];
	const activeRef = useRef<number>(-1);
	const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

	useEffect(() => {
		inputRef.current?.focus();
		const onKey = (e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	// Reset active index when results change
	useEffect(() => {
		activeRef.current = -1;
	}, [query]);

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		const total = flatResults.length;
		if (!total) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			activeRef.current = Math.min(activeRef.current + 1, total - 1);
			itemRefs.current[activeRef.current]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			activeRef.current = Math.max(activeRef.current - 1, 0);
			itemRefs.current[activeRef.current]?.focus();
		} else if (e.key === "Enter" && total > 0) {
			const first = flatResults[0];
			navigate(first.url);
			onClose();
		}
	}

	function handleResultClick(url: string) {
		navigate(url);
		onClose();
	}

	const showEmpty = query.length >= 2 && !hasResults;

	return (
		<div
			className="fixed inset-0 z-[100] flex flex-col"
			role="dialog"
			aria-modal="true"
			aria-label="Search"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Panel */}
			<div className="relative z-10 mt-16 mx-auto w-full max-w-2xl px-4">
				<div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
					{/* Input */}
					<div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
						<svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
						</svg>
						<input
							ref={inputRef}
							type="search"
							placeholder="Search recipes, meal plans, ingredients…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1 text-[#1f2937] text-base outline-none bg-transparent placeholder-gray-400"
							autoComplete="off"
						/>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
						>
							Esc
						</button>
					</div>

					{/* Results */}
					{hasResults && (
						<div className="max-h-[60vh] overflow-y-auto py-2">
							{results.plans.length > 0 && (
								<section>
									<p className="px-5 py-2 text-xs font-bold text-[#e07030] uppercase tracking-widest">
										Meal Plans
									</p>
									{results.plans.map((item, i) => (
										<ResultRow
											key={item.id}
											result={item}
											ref={(el) => { itemRefs.current[i] = el; }}
											onClick={() => handleResultClick(item.url)}
										/>
									))}
								</section>
							)}
							{results.recipes.length > 0 && (
								<section>
									<p className="px-5 py-2 text-xs font-bold text-[#e07030] uppercase tracking-widest">
										Recipes
									</p>
									{results.recipes.map((item, i) => (
										<ResultRow
											key={item.id}
											result={item}
											ref={(el) => { itemRefs.current[results.plans.length + i] = el; }}
											onClick={() => handleResultClick(item.url)}
										/>
									))}
								</section>
							)}
						</div>
					)}

					{showEmpty && (
						<div className="px-5 py-10 text-center text-gray-400 text-sm">
							No results for "<span className="font-medium text-gray-600">{query}</span>"
						</div>
					)}

					{!query && (
						<div className="px-5 py-6 text-center text-gray-400 text-sm">
							Try "chicken", "mushroom", "sheet pan", "high protein"…
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

import { forwardRef } from "react";

const ResultRow = forwardRef<HTMLAnchorElement, { result: SearchResult; onClick: () => void }>(
	({ result, onClick }, ref) => (
		<a
			ref={ref}
			href={`#${result.url}`}
			onClick={(e) => { e.preventDefault(); onClick(); }}
			className="flex items-center gap-3 px-5 py-3 hover:bg-[#faf8f4] focus:bg-[#faf8f4] outline-none transition-colors"
		>
			{/* Thumbnail */}
			<div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
				{result.image ? (
					<img src={result.image} alt="" className="w-full h-full object-cover" />
				) : (
					<div className="w-full h-full flex items-center justify-center text-xl">
						{result.kind === "plan" ? "🗓" : "🍽️"}
					</div>
				)}
			</div>

			{/* Text */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-[#1f2937] truncate">{result.title}</p>
				<p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
			</div>

			{/* Like count */}
			{result.likes > 0 && (
				<span className="flex items-center gap-1 text-xs text-red-400 flex-shrink-0">
					<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
					</svg>
					{result.likes}
				</span>
			)}

			{/* Arrow */}
			<svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
				<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
			</svg>
		</a>
	)
);
ResultRow.displayName = "ResultRow";
