import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { PostType, CommentType } from '../../interfaces/interfaces.post/post';
import Image from 'next/image';

interface Props {
  post: PostType;
  onUpdatePost: (post: PostType) => void;
}

export default function Post({ post, onUpdatePost }: Props) {
  // 👉 Dar like
  const handleLike = () => {
    const updated = { ...post, likes: post.likes + 1 };
    onUpdatePost(updated);
  };

  // 👉 Agregar comentario
  const handleAddComment = (comment: CommentType) => {
    const updated = { ...post, comments: [...post.comments, comment] };
    onUpdatePost(updated);
  };

  // 👉 Reportar post (simulado por ahora)
  const handleReport = () => {
    alert(`Post reportado (ID: ${post.id})`);
    // Podrás conectar esto con el backend más adelante (POST /api/posts/:id/report)
  };

  // 👉 Formatear fecha
  const date = new Date(post.createdAt).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="bg-gray-100 rounded-2xl shadow p-4 space-y-3 text-black">
      {/* HEADER DEL POST */}
      <div className="flex items-center justify-between">
        {/* Info del usuario */}
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
      <p className="text-gray-800 whitespace-pre-line">{post.content}</p>

      {/* BOTÓN DE LIKE */}
      <LikeButton likes={post.likes} onLike={handleLike} />

      {/* SECCIÓN DE COMENTARIOS */}
      <CommentSection
        comments={post.comments}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
