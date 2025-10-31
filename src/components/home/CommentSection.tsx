'use client';
import { useState } from 'react';
import { CommentType } from '@/interfaces/interfaces.post/post';
import { usePost } from '@/context/PostContext';
import Image from 'next/image';

export default function CommentSection({
  comments,
  postId,
}: {
  comments?: CommentType[] | null;
  postId: number;
}) {
  const [comment, setComment] = useState('');
  const { addComment, likeComment } = usePost();

  //  Aseguramos que siempre haya un array válido
  const safeComments = Array.isArray(comments) ? comments : [];

  //  Enviar nuevo comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment(postId, comment);
    setComment('');
  };

  return (
    <div className="border-t pt-3">
      {/* Lista de comentarios */}
      <ul className="space-y-3 text-sm text-gray-700">
        {safeComments.length === 0 ? (
          <p className="text-gray-500 text-sm">Sé el primero en comentar 💬</p>
        ) : (
          safeComments.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 bg-gray-100 rounded-xl p-3 shadow-sm"
            >
              <Image
                src={c.user?.avatar || '/avatars/default.jpg'}
                alt={c.user?.name || 'Usuario'}
                width={32}
                height={32}
                className="rounded-full object-cover mt-1"
              />

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {c.user?.name || 'Anónimo'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString('es-AR')
                      : ''}
                  </span>
                </div>

                <p className="text-gray-700 mt-1">{c.text}</p>

                {/* Like discreto */}
                <button
                  onClick={() => likeComment(c.id)}
                  className="self-start mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-yellow-500 transition"
                >
                  ❤️ <span>{c.likes ?? 0}</span>
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Formulario de nuevo comentario */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mt-4 items-center"
      >
        <Image
          src="/avatars/default.jpg"
          alt="Usuario actual"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <input
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
