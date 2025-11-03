'use client';
import { useEffect, useState } from 'react';
import { getUserMediaPosts, Post } from '@/services/postService';
import { getUserProfile } from '@/services/userService';
import VideoPlayer from '@/components/home/VideoPlayer';

export default function ProfileMedia() {
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Post | null>(null);

  useEffect(() => {
    const fetchUserMedia = async () => {
      try {
        setLoading(true);
        // Primero obtenemos el perfil del usuario para tener su ID
        const user = await getUserProfile();
        console.log('Usuario actual:', user);

        // Luego obtenemos solo sus posts con multimedia
        const userMedia = await getUserMediaPosts(user.id);
        console.log('Posts con media encontrados:', userMedia);

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
    <>
      <div className="grid grid-cols-3 gap-4">
        {mediaPosts.map((post) => {
          const mediaUrl = post.mediaURL || (post as any).mediaUrl;

          // Detectar si es video basándose en el tipo o en la extensión del archivo
          const isVideo = post.type === 'VIDEO' || (post as any).mediaType === 'video' || mediaUrl?.match(/\.(mp4|webm|ogg|mov|avi|wmv|mkv|m4v)$/i);

          return (
            <div key={post.id} className="relative group cursor-pointer" onClick={() => setSelectedMedia(post)}>
              {isVideo ? (
                <div className="relative">
                  <video className="rounded-lg w-full h-48 object-cover" src={mediaUrl || ''} muted />
                  {/* Icono de play */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black bg-opacity-60 rounded-full p-4 group-hover:bg-opacity-80 transition-all">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img src={mediaUrl || ''} alt="media" className="rounded-lg w-full h-48 object-cover transition-opacity hover:opacity-90" />
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para mostrar media en tamaño completo */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10">
            ×
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'VIDEO' || (selectedMedia as any).mediaType === 'video' || (selectedMedia.mediaURL || (selectedMedia as any).mediaUrl)?.match(/\.(mp4|webm|ogg|mov|avi|wmv|mkv|m4v)$/i) ? (
              <VideoPlayer src={selectedMedia.mediaURL || (selectedMedia as any).mediaUrl || ''} className="w-full rounded-xl" autoPlay={true} />
            ) : (
              <img src={selectedMedia.mediaURL || (selectedMedia as any).mediaUrl || ''} alt="media" className="w-full h-auto rounded-xl" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
