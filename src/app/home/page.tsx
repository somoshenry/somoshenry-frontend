'use client';
import { useState } from 'react';
import CreatePost from '../../components/CreatePost';
import PostList from '../../components/PostList';
import { PostType } from '../../interfaces/post';

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([  {
    id: 1,
    content: "¡Excelente trabajo en el proyecto de React! Los componentes quedaron muy bien estructurados 💪",
    likes: 24,
    comments: [
      { id: 1, text: "Gracias profe!" },
      { id: 2, text: "Fue un desafío, pero lo logramos 😄" },
    ],
  },
  {
    id: 2,
    content: "Finalmente entendí los hooks! useState y useEffect ya no son un misterio 🎉",
    likes: 45,
    comments: [
      { id: 1, text: "Bien ahí! 💪" },
      { id: 2, text: "Los hooks son magia cuando los entendés 🔥" },
    ],
  },
  {
    id: 3,
    content: "Hoy arranqué a practicar Next.js con Tailwind. Me encanta lo rápido que se puede maquetar 🚀",
    likes: 12,
    comments: [
      { id: 1, text: "Tailwind es una locura 🔥" },
      { id: 2, text: "Next.js + Tailwind = ❤️" },
    ],
  },]);

  const handleAddPost = (newPost: PostType) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: PostType) => {
    setPosts(posts.map(p => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <CreatePost onAddPost={handleAddPost} />
      <PostList posts={posts} onUpdatePost={handleUpdatePost} />
    </main>
  );
}