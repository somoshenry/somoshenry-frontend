'use client';
import CreatePost from '@/components/home/CreatePost';
import PostList from '@/components/home/PostList';
import { usePost } from '@/context/PostContext';

export default function HomePage() {
  const { posts, loading, fetchPosts } = usePost();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Crear nuevo post */}
        <CreatePost />

        {/* Estado de carga */}
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Cargando publicaciones...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No hay publicaciones aún 😅</p>
        ) : (
          <PostList posts={posts} onUpdatePost={() => fetchPosts()} />
        )}
      </main>
    </div>
  );
}