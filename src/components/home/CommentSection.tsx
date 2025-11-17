'use client';
import { useState } from 'react';
import { CommentType } from '@/interfaces/interfaces.post/post';
import { usePost } from '@/context/PostContext';
import { useAuth } from '@/hook/useAuth';
import Comment from './Comment';

export default function CommentSection({ comments, postId }: { comments?: CommentType[] | null; postId: string }) {
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { addComment } = usePost();
  const { user } = useAuth();

  // Usuario suspendido no puede comentar
  const isSuspended = user?.status === 'SUSPENDED';

  // Aseguramos que siempre haya un array válido
  const safeComments = Array.isArray(comments) ? comments : [];

  // Filtrar solo comentarios de nivel superior (sin parentId)
  const topLevelComments = safeComments.filter((c) => !c.parentId);

  // Organizar comentarios anidados
  const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const tree: CommentType[] = [];

    // Crear mapa de comentarios
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Construir árbol
    comments.forEach((comment) => {
      const node = commentMap.get(comment.id);
      if (!node) return;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(node);
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  };

  const commentTree = buildCommentTree(safeComments);

  // Enviar nuevo comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuspended) {
      alert('Tu cuenta está suspendida. No puedes comentar 🚫');
      return;
    }

    const text = comment.trim();
    if (!text) return;
    try {
      setIsSending(true);
      await addComment(postId, text);
      setComment('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t pt-3">
      {/* Lista de comentarios anidados */}
      {commentTree.length === 0 ? (
        <p className="text-gray-500 text-sm">Sé el primero en comentar 💬</p>
      ) : (
        <div className="space-y-2">
          {commentTree.map((c) => (
            <Comment key={c.id} comment={c} postId={postId} />
          ))}
        </div>
      )}

      {/* Formulario de nuevo comentario */}
      {isSuspended ? (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
          <span className="text-sm text-red-700 dark:text-red-400">🚫 Tu cuenta está suspendida. No puedes comentar.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 items-center">
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario..." type="text" className="flex-1 border p-2 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-300" />
          <button type="submit" className="bg-[#ffff00] px-3 py-2 rounded-lg text-black hover:bg-yellow-300 transition" disabled={isSending || !comment.trim()}>
            {isSending ? 'Enviando...' : 'Comentar'}
          </button>
        </form>
      )}
    </div>
  );
}
