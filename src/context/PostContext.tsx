'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import { PostType } from '../interfaces/interfaces.post/post';
import { useAlert } from './AlertContext';

interface PostContextType {
  posts: PostType[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (content: string, media?: File | null) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  addComment: (postId: number, text: string) => Promise<void>;
  likeComment: (commentId: number) => Promise<void>;
  reportPost: (postId: number) => Promise<void>;
}

const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  // Obtiene y normaliza los posts del backend
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;

      //  Normaliza los campos (evita undefined o null)
      const normalized = (postsArray || []).map((p: any) => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments : [],
        likes: typeof p.likes === 'number' ? p.likes : 0,
        mediaUrl: p.mediaUrl || null,
        mediaType: p.mediaType || null,
      }));

      setPosts(normalized);
    } catch (err) {
      console.error('Error al cargar posts:', err);
      showAlert('Error al cargar publicaciones ❌', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  //  Crear un nuevo post
  const addPost = async (content: string, media?: File | null) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (media) formData.append('media', media);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPost = {
        ...data,
        comments: Array.isArray(data.comments) ? data.comments : [],
        likes: typeof data.likes === 'number' ? data.likes : 0,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
      };

      setPosts((prev) => [newPost, ...prev]);
      showAlert('Publicación creada correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al crear post:', err);
      showAlert('Error al crear publicación ❌', 'error');
    }
  };

  //  Like en un post
  const likePost = async (id: number) => {
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, likes: typeof data.likes === 'number' ? data.likes : p.likes + 1 }
            : p
        )
      );
    } catch (err) {
      console.error('Error al dar like:', err);
      showAlert('Error al dar like ❌', 'error');
    }
  };

  //  Agregar un comentario
  const addComment = async (postId: number, text: string) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), data] }
            : p
        )
      );
    } catch (err) {
      console.error('Error al comentar:', err);
      showAlert('Error al comentar ❌', 'error');
    }
  };

  //  Like a comentario
  const likeComment = async (commentId: number) => {
    try {
      await api.post(`/comments/${commentId}/like`);
    } catch (err) {
      console.error('Error al likear comentario:', err);
      showAlert('Error al dar like al comentario ❌', 'error');
    }
  };

  //  Reportar post
  const reportPost = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/report`);
      showAlert('Reporte enviado correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al reportar post:', err);
      showAlert('Error al enviar el reporte ❌', 'error');
    }
  };

  //  Carga inicial
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        fetchPosts,
        addPost,
        likePost,
        addComment,
        likeComment,
        reportPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePost debe usarse dentro de un PostProvider');
  return context;
};
