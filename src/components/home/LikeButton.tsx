'use client';
import { useState } from 'react';

interface Props {
  likes: number;
  onLike: () => void;
}

export default function LikeButton({ likes, onLike }: Props) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isClicked) return; // Evita spam de clics
    setIsClicked(true);
    onLike();
    setTimeout(() => setIsClicked(false), 300); // pequeña animación
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-medium transition-transform ${
        isClicked ? 'scale-110 text-red-500' : 'text-black hover:text-red-500'
      }`}
    >
      ❤️ <span>{likes ?? 0}</span> <span>Me gusta</span>
    </button>
  );
}
