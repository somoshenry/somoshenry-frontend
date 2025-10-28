import { useState } from 'react';
import { CommentType } from '../interfaces/post';

interface Props {
  comments: CommentType[];
  onAddComment: (comment: CommentType) => void;
}

export default function CommentSection({ comments, onAddComment }: Props) {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment: CommentType = {
      id: Date.now(),
      text: comment,
    };

    onAddComment(newComment);
    setComment('');
  };

  return (
    <div className=" pt-2">
      <ul className="space-y-1 text-sm text-black">
        {comments.map((c) => (
          <li key={c.id}>💬 {c.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 border p-1 rounded-lg text-sm text-black"
        />
        <button
          type="submit"
          className="bg-[#ffff00] px-2 py-1 rounded-lg text-black hover:bg-yellow-300 transition"
        >
          Comentar
        </button>
      </form>
    </div>
  );
}
