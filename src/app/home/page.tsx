"use client";
import {useState} from "react";
import CreatePost from "../../components/home/CreatePost";
import PostList from "../../components/home/PostList";
import {PostType} from "../../interfaces/interfaces.post/post";

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([
    {
      id: 1,
      content: "¡Excelente trabajo en el proyecto de React! Los componentes quedaron muy bien estructurados 💪",
      likes: 24,
      createdAt: "2025-10-27T14:00:00Z",
      user: {
        id: 1,
        name: "María García",
        avatar: "/avatars/maria.jpg",
      },
      comments: [
        {
          id: 1,
          text: "Gracias profe!",
          createdAt: "2025-10-27T15:10:00Z",
          user: {id: 2, name: "Pedro Sánchez", avatar: "/avatars/pedro.jpg"},
        },
        {
          id: 2,
          text: "Fue un desafío, pero lo logramos 😄",
          createdAt: "2025-10-27T15:20:00Z",
          user: {id: 3, name: "Sofía López", avatar: "/avatars/sofia.jpg"},
        },
      ],
    },
    {
      id: 2,
      content: "Finalmente entendí los hooks! useState y useEffect ya no son un misterio 🎉",
      likes: 45,
      createdAt: "2025-10-28T10:30:00Z",
      user: {
        id: 2,
        name: "Carlos Méndez",
        avatar: "/avatars/carlos.jpg",
      },
      comments: [
        {
          id: 1,
          text: "Bien ahí! 💪",
          createdAt: "2025-10-28T11:00:00Z",
          user: {id: 4, name: "Laura Martínez", avatar: "/avatars/laura.jpg"},
        },
        {
          id: 2,
          text: "Los hooks son magia cuando los entendés 🔥",
          createdAt: "2025-10-28T11:15:00Z",
          user: {id: 3, name: "Sofía López", avatar: "/avatars/sofia.jpg"},
        },
      ],
    },
    {
      id: 3,
      content: "Hoy arranqué a practicar Next.js con Tailwind. Me encanta lo rápido que se puede maquetar 🚀",
      likes: 12,
      createdAt: "2025-10-28T08:00:00Z",
      user: {
        id: 3,
        name: "Sofía López",
        avatar: "/avatars/sofia.jpg",
      },
      comments: [
        {
          id: 1,
          text: "Tailwind es una locura 🔥",
          createdAt: "2025-10-28T08:20:00Z",
          user: {id: 2, name: "Pedro Sánchez", avatar: "/avatars/pedro.jpg"},
        },
        {
          id: 2,
          text: "Next.js + Tailwind = ❤️",
          createdAt: "2025-10-28T08:30:00Z",
          user: {id: 4, name: "Laura Martínez", avatar: "/avatars/laura.jpg"},
        },
      ],
    },
  ]);

  const handleAddPost = (newPost: PostType) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: PostType) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    // pt-16: compensa la navbar (h-16)
    // md:ml-64: compensa la sidebar en desktop (w-64)
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <CreatePost onAddPost={handleAddPost} />
        <PostList posts={posts} onUpdatePost={handleUpdatePost} />
      </main>
    </div>
  );
}
