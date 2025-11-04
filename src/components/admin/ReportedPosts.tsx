'use client';
import { AlertTriangle, Trash2, Eye, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPosts, deletePost, AdminPost } from '@/services/adminService';

export default function ReportedPosts() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { posts: fetchedPosts } = await getPosts({ page: 1, limit: 50 });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error al cargar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      alert('Error al eliminar post');
    }
  };

  const getDisplayName = (user: AdminPost['user']) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email.split('@')[0];
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Posts</h2>
          <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">{posts.length} posts</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando posts...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay posts disponibles</div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{getDisplayName(post.user)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  {post.title && <h3 className="font-bold text-gray-900 dark:text-white mb-1">{post.title}</h3>}
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{truncateContent(post.content)}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">{post.type}</span>
                    {post._count && (
                      <>
                        <span>{post._count.comments} comentarios</span>
                        <span>{post._count.likes} likes</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm" onClick={() => window.open(`/home`, '_blank')}>
                  <Eye size={16} />
                  Ver en feed
                </button>
                <button onClick={() => handleDeletePost(post.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
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
