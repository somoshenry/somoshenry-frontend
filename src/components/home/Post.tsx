'use client';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { PostType, CommentType } from '../../interfaces/interfaces.post/post';
import Image from 'next/image';

interface Props {
  post: PostType;
  onUpdatePost: (post: PostType) => void;
}

export default function Post({ post, onUpdatePost }: Props) {
  // 👉 Dar like al post
  const handleLike = () => {
    const updated = { ...post, likes: post.likes + 1 };
    onUpdatePost(updated);
  };

  // 👉 Agregar comentario
  const handleAddComment = (comment: CommentType) => {
    const updated = { ...post, comments: [...post.comments, comment] };
    onUpdatePost(updated);
  };

  // 👉 Reportar post (por ahora simulado)
  const handleReport = () => {
    alert(`Post reportado (ID: ${post.id})`);
    // ⚙️ luego reemplazar por showAlert('Reporte enviado', 'success') cuando integremos el AlertContext
  };

  // 👉 Formatear fecha
  const date = new Date(post.createdAt).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-5 text-black space-y-4">
      {/* HEADER DEL POST */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={post.user?.avatar || '/avatars/default.jpg'}
            alt={post.user?.name || 'Usuario'}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{post.user?.name}</p>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
        </div>

        {/* Botón de reportar */}
        <button
          onClick={handleReport}
          className="text-gray-400 hover:text-red-500 transition text-sm"
        >
          🚩 Reportar
        </button>
      </div>

      {/* CONTENIDO DEL POST */}
      {post.content && (
        <p className="text-gray-800 whitespace-pre-line bg-gray-200 rounded-xl p-3">
          {post.content}
        </p>
      )}

      {/* MULTIMEDIA (imagen o video) */}
      {post.mediaUrl && (
        <div className="overflow-hidden rounded-xl border border-gray-300">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full rounded-xl"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full object-cover max-h-[400px] rounded-xl"
            />
          )}
        </div>
      )}

      {/* BOTONES DE INTERACCIÓN */}
      <div className="flex items-center justify-between mt-2">
        <LikeButton likes={post.likes} onLike={handleLike} />
        <span className="text-xs text-gray-500">
          {post.comments.length} comentarios
        </span>
      </div>

      {/* SECCIÓN DE COMENTARIOS */}
      <div className="border-t border-gray-300 pt-3">
        <CommentSection comments={post.comments} onAddComment={handleAddComment} />
      </div>
    </div>
  );
}
