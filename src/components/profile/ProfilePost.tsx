'use client';
import { useEffect, useState } from 'react';
import { getUserPosts, Post } from '@/services/postService';
import { getUserProfile } from '@/services/userService';

export default function ProfilePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        // Primero obtenemos el perfil del usuario para tener su ID
        const user = await getUserProfile();
        // Luego obtenemos sus posts
        const userPosts = await getUserPosts(user.id);
        setPosts(userPosts);
      } catch (err) {
        console.error('Error al cargar los posts:', err);
        setError('No se pudieron cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg">No has realizado ninguna publicación aún</p>
        <p className="text-sm mt-2">¡Comparte tu primer post!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          {/* Contenido del post */}
          <p className="dark:text-white">{post.content}</p>

          {/* Mostrar multimedia si existe */}
          {post.mediaURL && post.type === 'IMAGE' && <img src={post.mediaURL} alt="Post media" className="mt-3 rounded-lg max-h-96 w-full object-cover" />}

          {post.mediaURL && post.type === 'VIDEO' && <video controls className="mt-3 rounded-lg max-h-96 w-full" src={post.mediaURL} />}

          {/* Información del post */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>❤️ {post.likes.length} Me gusta</span>
              <span>💬 {post.comments.length} Comentarios</span>
            </div>
            <span>{new Date(post.createdAt).toLocaleDateString('es-ES')}</span>
          </div>

          {/* Indicador de tipo de post */}
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{post.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
