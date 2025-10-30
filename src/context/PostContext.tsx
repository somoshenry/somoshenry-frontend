'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import { PostType } from '../interfaces/interfaces.post/post';

interface PostContextType {
  posts: PostType[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (content: string) => Promise<void>;
  likePost: (id: number) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (content: string) => {
    const { data } = await api.post('/posts', { content });
    setPosts((prev) => [data, ...prev]);
  };

  const likePost = async (id: number) => {
    const { data } = await api.post(`/posts/${id}/like`);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: data.likes } : p)));
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <PostContext.Provider value={{ posts, loading, fetchPosts, addPost, likePost }}>
      {children}
    </PostContext.Provider>
  );
}
