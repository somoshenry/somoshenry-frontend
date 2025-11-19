"use client";
interface Props {
  likes: number;
  liked?: boolean;
  onLike: () => void;
}

export default function LikeButton({likes, liked = false, onLike}: Props) {
  return (
    <button
      onClick={onLike}
      className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-transform ${
        liked ? "scale-105 text-red-500" : "text-black hover:text-red-500 cursor-pointer"
      }`}
      aria-pressed={liked}
      title={liked ? "Quitar me gusta" : "Me gusta"}
    >
      ❤️ <span>{likes ?? 0}</span> <span>Me gusta</span>
    </button>
  );
}
