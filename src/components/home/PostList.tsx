'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hook/useAuth';
import { getFollowLists } from '@/services/followService';
import Post from './Post';
import { PostType } from '../../interfaces/interfaces.post/post';

interface Props {
  posts?: PostType[] | null;
  onUpdatePost?: (post: PostType) => void;
  activeTab?: 'todos' | 'siguiendo';
}

export default function PostList({ posts = [], onUpdatePost, activeTab = 'todos' }: Props) {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Cargar lista de usuarios que sigo
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user?.id || activeTab !== 'siguiendo') return;

      try {
        setLoadingFollowing(true);
        const { following } = await getFollowLists(user.id);
        const ids = following.map((u) => u.id);
        setFollowingIds(ids);
      } catch (error) {
        console.error('Error al cargar usuarios seguidos:', error);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [user?.id, activeTab]);

  // Garantiza que siempre tengamos un array y elimina duplicados por ID
  const safePosts = Array.isArray(posts) ? posts.filter((post, index, self) => index === self.findIndex((p) => p.id === post.id)) : [];

  // Filtrar posts según la pestaña activa (los posts usan "user", no "author")
  const filteredPosts = activeTab === 'siguiendo' ? safePosts.filter((post) => post?.user?.id && followingIds.includes(post.user.id)) : safePosts;

  if (loadingFollowing && activeTab === 'siguiendo') {
    return <p className="text-center text-gray-500 animate-pulse">Cargando posts de tus amigos...</p>;
  }

  if (filteredPosts.length === 0) {
    if (activeTab === 'siguiendo') {
      return (
        <div className="text-center py-12 px-4">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hay publicaciones de personas que sigues</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">¡Comienza a seguir a más personas para ver sus publicaciones aquí! 👥</p>
        </div>
      );
    }
    return <p className="text-center text-gray-500">No hay publicaciones disponibles 😅</p>;
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => (
        <Post key={post.id} post={post} onUpdatePost={onUpdatePost || (() => {})} />
      ))}
    </div>
  );
}
