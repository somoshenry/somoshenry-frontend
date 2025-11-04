'use client';
import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/home/VideoPlayer';
import { getUserMediaPosts, Post } from '@/services/postService';

interface UserProfileMediaProps {
  userId: string;
}

export default function UserProfileMedia({ userId }: UserProfileMediaProps) {
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaPosts = async () => {
      try {
        setLoading(true);
        const posts = await getUserMediaPosts(userId);
        setMediaPosts(posts);
      } catch (err) {
        console.error('Error al cargar multimedia:', err);
        setError('No se pudo cargar la multimedia');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaPosts();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando multimedia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (mediaPosts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Este usuario no tiene contenido multimedia aún 📸</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-4 pb-6">
      {mediaPosts.map((post) => {
        const url = post.mediaURL || (post as any).mediaUrl || '';
        const ext = url.split('.').pop()?.toLowerCase() || '';
        const isVideo = post.type === 'VIDEO' || ['mp4', 'webm', 'mov', 'avi', 'wmv', 'mkv', 'm4v'].includes(ext);
        return (
          <div key={post.id} className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow group relative">
            {isVideo ? <VideoPlayer src={url} className="w-full h-full" objectFit="cover" /> : <img src={url} alt="media" className="w-full h-full object-cover" />}
            {/* Overlay con información del post */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-center">
                <p className="text-sm font-semibold">{isVideo ? '🎥 Video' : '📷 Imagen'}</p>
                {post.content && <p className="text-xs mt-1 px-2 line-clamp-2">{post.content}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
