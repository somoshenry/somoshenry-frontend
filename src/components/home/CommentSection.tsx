'use client';
import { useState } from 'react';
import { CommentType } from '../../interfaces/interfaces.post/post';
import Image from 'next/image';

interface Props {
  comments: CommentType[];
  onAddComment: (comment: CommentType) => void;
}

export default function CommentSection({ comments, onAddComment }: Props) {
  const [comment, setComment] = useState('');

  // Maneja el envío de nuevo comentario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment: CommentType = {
      id: Date.now(),
      text: comment,
      createdAt: new Date().toISOString(),
      likes: 0,
      user: {
        id: 99, // usuario actual temporal
        name: 'Usuario Actual',
        avatar: '/avatars/default.jpg',
      },
    };

    onAddComment(newComment);
    setComment('');
  };

  // Maneja el like de un comentario
  const handleLike = (id: number) => {
    const updated = comments.map((c) =>
      c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c
    );
    // No hay función onUpdateComment, así que el cambio solo se refleja localmente
    // Si luego querés guardar en el backend, podemos hacerlo con un callback
  };

  return (
    <div className="border-t pt-3">
      {/* LISTA DE COMENTARIOS */}
      <ul className="space-y-3 text-sm text-gray-700">
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-3 bg-gray-100 rounded-xl p-3 shadow-sm"
          >
            {/* Avatar */}
            <Image
              src={c.user?.avatar || '/avatars/default.jpg'}
              alt={c.user?.name || 'Usuario'}
              width={32}
              height={32}
              className="rounded-full object-cover mt-1"
            />

            {/* Contenido del comentario */}
            <div className="flex-1 flex flex-col">
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

              {/* Like discreto */}
              <button
                onClick={() => handleLike(c.id)}
                className="self-start mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-yellow-500 transition"
              >
                ❤️ <span>{c.likes || 0}</span>
              </button>
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
          className="flex-1 border p-2 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
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
