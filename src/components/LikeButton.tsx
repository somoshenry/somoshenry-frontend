interface Props {
  likes: number;
  onLike: () => void;
}

export default function LikeButton({ likes, onLike }: Props) {
  return (
    <button
      onClick={onLike}
      className="flex items-center gap-2 text-sm text-black hover:text-blue-500 transition"
    >
      ❤️ {likes} Me gusta
    </button>
  );
}
