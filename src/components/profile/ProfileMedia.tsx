'use client';
import { useEffect, useState } from 'react';
import { getUserMediaPosts, Post } from '@/services/postService';
import { getUserProfile } from '@/services/userService';

export default function ProfileMedia() {
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMedia = async () => {
      try {
        setLoading(true);
        // Primero obtenemos el perfil del usuario para tener su ID
        const user = await getUserProfile();
        // Luego obtenemos solo sus posts con multimedia
        const userMedia = await getUserMediaPosts(user.id);
        setMediaPosts(userMedia);
      } catch (err) {
        console.error('Error al cargar multimedia:', err);
        setError('No se pudo cargar la multimedia');
      } finally {
        setLoading(false);
      }
    };

    fetchUserMedia();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (mediaPosts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg">No has subido ningún archivo multimedia aún</p>
        <p className="text-sm mt-2">Comparte tus fotos y videos con la comunidad</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {mediaPosts.map((post) => (
        <div key={post.id} className="relative group">
          {post.type === 'IMAGE' && post.mediaURL ? (
            <div className="relative">
              <img src={post.mediaURL} alt="media" className="rounded-lg w-full h-48 object-cover cursor-pointer transition-opacity hover:opacity-75" />
              {/* Overlay con información al hacer hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center text-sm">
                  <p>❤️ {post.likes?.length || 0}</p>
                  <p>💬 {post.comments?.length || 0}</p>
                </div>
              </div>
            </div>
          ) : post.type === 'VIDEO' && post.mediaURL ? (
            <div className="relative">
              <video
                className="rounded-lg w-full h-48 object-cover cursor-pointer"
                src={post.mediaURL}
                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                onMouseLeave={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.pause();
                  video.currentTime = 0;
                }}
              />
              {/* Icono de play */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center text-sm">
                  <p>❤️ {post.likes?.length || 0}</p>
                  <p>💬 {post.comments?.length || 0}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
