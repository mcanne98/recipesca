import { useLike } from "../hooks/useLike";

interface Props {
	type: "recipe" | "plan";
	id: string;
	size?: "sm" | "md";
}

export default function LikeButton({ type, id, size = "md" }: Props) {
	const { count, liked, loading, like } = useLike(type, id);

	const isSmall = size === "sm";

	return (
		<button
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				like();
			}}
			disabled={liked || loading}
			aria-label={liked ? `${count} likes` : "Like this"}
			className={`inline-flex items-center gap-1.5 rounded-full border transition-all
				${isSmall ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm font-semibold"}
				${liked
					? "bg-red-50 border-red-200 text-red-500 cursor-default"
					: "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400 hover:bg-red-50 cursor-pointer"
				}
				${loading ? "opacity-60" : ""}
			`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"}
				fill={liked ? "currentColor" : "none"}
				stroke="currentColor"
				strokeWidth={2}
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
				/>
			</svg>
			<span>{count > 0 ? count : liked ? "1" : "Like"}</span>
		</button>
	);
}
