'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import { PostType } from '../interfaces/interfaces.post/post';
import { useAlert } from './AlertContext';
import { string } from 'yup';

interface PostContextType {
  posts: PostType[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (content: string, media?: File | null) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  reportPost: (postId: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | null>(null);

// Evita doble fetch en desarrollo (React StrictMode monta/desmonta)
let didLoadInitialPosts = false;

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  // Obtiene y normaliza los posts del backend
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;

      // Cargar comentarios para cada post
      const postsWithComments = await Promise.all(
        (postsArray || []).map(async (p: PostType) => {
          try {
            // Intentar cargar comentarios del post
            const commentsResponse = await api.get(`/post/${p.id}/comments`);
            const comments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
            
            return {
              ...p,
              comments: comments,
              likes: typeof p.likes === 'number' ? p.likes : 0,
              // Compatibilidad con ambos campos de media
              mediaUrl: p.mediaURL || p.mediaUrl || null,
              mediaURL: p.mediaURL || p.mediaUrl || null,
              mediaType: p.mediaType || null,
            };
          } catch (err) {
            // Si falla la carga de comentarios, continuar con array vacío
            console.warn(`No se pudieron cargar comentarios del post ${p.id}`, err);
            return {
              ...p,
              comments: [],
              likes: typeof p.likes === 'number' ? p.likes : 0,
              mediaUrl: p.mediaURL || p.mediaUrl || null,
              mediaURL: p.mediaURL || p.mediaUrl || null,
              mediaType: p.mediaType || null,
            };
          }
        })
      );

      setPosts(postsWithComments);
    } catch (err) {
      console.error('Error al cargar posts:', err);
      showAlert('Error al cargar publicaciones ❌', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  //  Crear un nuevo post
  const addPost = async (content: string, media?: File | null) => {
    try {
      // CreatePostDto expects JSON: { content, type?, mediaURL? }
      let mediaURL: string | undefined;

      if (media) {
        try {
          // Intentamos subir el archivo a /uploads si existe (backend puede implementarlo)
          const uploadForm = new FormData();
          uploadForm.append('file', media);
          const uploadResp = await api.post('/uploads', uploadForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          mediaURL = uploadResp.data?.url ?? uploadResp.data;
        } catch (uploadErr: unknown) {
          // Si /uploads no existe o falla, avisamos y continuamos sin media
          console.warn('Upload failed or /uploads missing, creating post without media', uploadErr);
          showAlert('No se pudo subir el archivo; la publicación se creará sin multimedia', 'info');
          mediaURL = undefined;
        }
      }

      const payload: Record<string, unknown> = { content };
      if (mediaURL) payload.mediaURL = mediaURL;

      const { data } = await api.post('/posts', payload);

      const newPost = {
        ...data,
        comments: Array.isArray(data.comments) ? data.comments : [],
        likes: typeof data.likes === 'number' ? data.likes : 0,
        mediaUrl: data.mediaURL ?? data.mediaUrl ?? null,
        mediaURL: data.mediaURL ?? data.mediaUrl ?? null,
        mediaType: data.mediaType ?? null,
      };

      setPosts((prev) => [newPost, ...prev]);
      showAlert('Publicación creada correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al crear post:', err);
      showAlert('Error al crear publicación ❌', 'error');
    }
  };

  //  Like en un post
  const likePost = async (id: string) => {
    try {
      // Optimistic update locally
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)));

      // Try to call backend like endpoint if it exists. If 404, ignore (backend may not implement likes).
      try {
        const { data } = await api.post(`/posts/${id}/like`);
        const serverLikes = typeof data?.likes === 'number' ? data.likes : undefined;
        if (typeof serverLikes === 'number') {
          setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: serverLikes } : p)));
        }
      } catch (innerErr: unknown) {
        // If endpoint missing or error, just keep optimistic value and notify user
        type ErrWithResponse = { response?: { status?: number } };
        const status = typeof innerErr === 'object' && innerErr !== null ? (innerErr as ErrWithResponse).response?.status : undefined;
        if (status === 404) {
          console.info('/posts/:id/like not implemented in backend; skipping server sync');
        } else {
          console.warn('Error calling like endpoint:', innerErr);
          showAlert('No se pudo sincronizar like con el servidor', 'info');
        }
      }
    } catch (err) {
      console.error('Error al dar like:', err);
      showAlert('Error al dar like ❌', 'error');
    }
  };

  
  const addComment = async (postId: string, text: string) => {
    try {
      const { data } = await api.post(`/comment/post/${postId}`, { content: text });

      const comment = data;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );

      showAlert('Comentario agregado correctamente ✅', 'success');
    } catch (err) {
      showAlert('Error al agregar comentario ❌', 'error');
      console.error('Error al comentar:', err);
    }
  };


  //  Like a comentario
  const likeComment = async (commentId: string) => {
    try {
      await api.post(`/comment/${commentId}/like`);
      
      // Actualizar localmente el contador de likes del comentario
      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          comments: p.comments?.map((c) =>
            c.id === commentId ? { ...c, likeCount: (c.likeCount || 0) + 1 } : c
          ) || [],
        }))
      );
      
      showAlert('Like agregado al comentario ✅', 'success');
    } catch (err) {
      console.error('Error al likear comentario:', err);
      showAlert('Error al dar like al comentario ❌', 'error');
    }
  };

  //  Reportar post
  const reportPost = async (postId: string) => {
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
    if (didLoadInitialPosts) return;
    didLoadInitialPosts = true;
    fetchPosts();
  }, [fetchPosts]);

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
