import { useState } from 'react';
import { CommentType } from '../../interfaces/interfaces.post/post';
import Image from 'next/image';

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
      createdAt: new Date().toISOString(),
      user: {
        id: 99, // usuario actual (temporal)
        name: 'Usuario Actual',
        avatar: '/avatars/default.jpg',
      },
    };

    onAddComment(newComment);
    setComment('');
  };

  return (
    <div className="border-t pt-3">
      {/* LISTA DE COMENTARIOS */}
      <ul className="space-y-3 text-sm text-gray-700">
        {comments.map((c) => (
          <li key={c.id} className="flex items-start gap-3">
            {/* Avatar del usuario */}
            <Image
              src={c.user?.avatar || '/avatars/default.jpg'}
              alt={c.user?.name || 'Usuario'}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />

            <div className="flex flex-col bg-gray-100 rounded-xl px-3 py-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">
                  {c.user?.name || 'Anónimo'}
                </span>
                <span className="text-xs text-gray-500">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString('es-AR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : ''}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* FORMULARIO DE NUEVO COMENTARIO */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 items-center">
        <Image
          src="/avatars/default.jpg"
          alt="Usuario actual"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 border p-2 rounded-lg text-sm text-black"
        />
        <button
          type="submit"
          className="bg-[#ffff00] px-3 py-2 rounded-lg text-black hover:bg-yellow-300 transition"
        >
          Comentar
        </button>
      </form>
    </div>
  );
}
