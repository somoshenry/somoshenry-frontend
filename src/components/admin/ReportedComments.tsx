'use client';
import { MessageSquare, Trash2, Eye, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getComments, deleteComment, AdminComment } from '@/services/adminService';

export default function ReportedComments() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { comments: fetchedComments } = await getComments({ page: 1, limit: 50 });
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      alert('Error al eliminar comentario');
    }
  };

  const getDisplayName = (user: AdminComment['user']) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email.split('@')[0];
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Comentarios</h2>
          <span className="ml-auto bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">{comments.length} comentarios</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay comentarios disponibles</div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.map((comment) => (
            <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{getDisplayName(comment.user)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 italic">"{comment.content}"</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      En el post: <span className="font-medium">{comment.post.title || truncateContent(comment.post.content, 50)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm" onClick={() => window.open(`/home`, '_blank')}>
                  <Eye size={16} />
                  Ver post
                </button>
                <button onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
