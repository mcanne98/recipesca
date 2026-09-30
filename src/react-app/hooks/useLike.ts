import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.DEV ? "http://localhost:8787" : "";

function getFingerprint(): string {
	try {
		let fp = localStorage.getItem("wowok_fp");
		if (!fp) {
			fp = crypto.randomUUID();
			localStorage.setItem("wowok_fp", fp);
		}
		return fp;
	} catch {
		return "anon";
	}
}

export function useLike(type: "recipe" | "plan", id: string) {
	const [count, setCount] = useState(0);
	const [liked, setLiked] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!id) return;
		const fp = getFingerprint();
		fetch(`${API_BASE}/api/likes?type=${type}&id=${encodeURIComponent(id)}&fp=${fp}`)
			.then((r) => r.json())
			.then((data: { count: number; liked: boolean }) => {
				setCount(data.count ?? 0);
				setLiked(data.liked ?? false);
			})
			.catch(() => {});
	}, [type, id]);

	const like = useCallback(async () => {
		if (liked || loading) return;
		setLoading(true);
		// Optimistic update
		setCount((c) => c + 1);
		setLiked(true);
		try {
			const fp = getFingerprint();
			const res = await fetch(`${API_BASE}/api/like`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type, id, fp }),
			});
			const data = await res.json() as { count: number; liked: boolean };
			setCount(data.count ?? 0);
			setLiked(data.liked ?? true);
		} catch {
			// revert on failure
			setCount((c) => Math.max(0, c - 1));
			setLiked(false);
		} finally {
			setLoading(false);
		}
	}, [type, id, liked, loading]);

	return { count, liked, loading, like };
}
