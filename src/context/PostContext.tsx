'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { tokenStore } from '../services/tokenStore';
import { PostType } from '../interfaces/interfaces.post/post';
import { useAlert } from './AlertContext';
import { useAuth } from '../hook/useAuth';

interface PostContextType {
  posts: PostType[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (content: string, media?: File | null) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  reportPost: (postId: string, reason: string, description?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const hasMountedRef = useRef(false);

  // ✅ Verifica si hay token válido
  const hasValidToken = (): boolean => {
    const token = tokenStore.getAccess();
    return !!token && token !== 'undefined' && token !== 'null';
  };

  // ✅ Normaliza post con manejo seguro
  const normalizePost = async (p: PostType) => {
    try {
      const commentsResponse = await api.get(`/post/${p.id}/comments`);
      const rawComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
      const currentUserId = user?.id;
      const comments = rawComments.map((c: any) => {
        const liked = Array.isArray(c?.likes) && currentUserId ? c.likes.some((l: any) => l?.userId === currentUserId) : false;
        return { ...c, likedByMe: liked };
      });

      let likeCount = 0;
      try {
        const likesResp = await api.get(`/posts/${p.id}/likes`);
        likeCount = Number(likesResp.data?.likeCount ?? 0);
      } catch {
        likeCount = 0;
      }

      let mediaType: 'image' | 'video' | null = null;
      if (p.type === 'VIDEO') mediaType = 'video';
      else if (p.type === 'IMAGE') mediaType = 'image';
      else if (p.mediaURL || p.mediaUrl) {
        const url = p.mediaURL || p.mediaUrl || '';
        const videoExt = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.mkv', '.m4v'];
        mediaType = videoExt.some((ext) => url.toLowerCase().includes(ext)) ? 'video' : 'image';
      }

      return {
        ...p,
        comments,
        likes: likeCount,
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaURL: p.mediaURL || p.mediaUrl || null,
        mediaType,
        likedByMe: false as unknown as boolean,
      };
    } catch (err) {
      console.warn(`No se pudieron cargar comentarios del post ${p.id}`, err);
      return {
        ...p,
        comments: [],
        likes: 0,
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaURL: p.mediaURL || p.mediaUrl || null,
        mediaType: null,
        likedByMe: false as unknown as boolean,
      };
    }
  };

  // ✅ Obtiene y normaliza los posts (con control de token)
  const fetchPosts = useCallback(async () => {
    // No intentar cargar posts si no hay token
    const token = tokenStore.getAccess();
    if (!token) {
      console.log('No hay token, saltando carga de posts');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;
      const postsWithComments = await Promise.all((postsArray || []).map(normalizePost));
      setPosts(postsWithComments);
    } catch (err) {
      console.error('Error al cargar posts:', err);
      // Solo mostrar alerta si no es un error 401 (no autenticado)
      if ((err as any)?.response?.status !== 401) {
        showAlert('Error al cargar publicaciones ❌', 'error');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert, user?.id]);

  // ✅ Refresco silencioso con protección
  const refreshPostsSilently = useCallback(async () => {
    // No intentar refrescar si no hay token
    const token = tokenStore.getAccess();
    if (!token) return;

    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;
      const normalized = await Promise.all((postsArray || []).map(normalizePost));
      setPosts(normalized);
    } catch (err) {
      // silencioso - no mostrar error si es 401
      if ((err as any)?.response?.status !== 401) {
        console.warn('Error refrescando publicaciones (silencioso):', err);
      }
    }
  }, [user?.id]);

  // ✅ Crear post (verifica token)
  const addPost = async (content: string, media?: File | null) => {
    const token = tokenStore.getAccess();
    if (!token) {
      showAlert('Debes iniciar sesión para crear publicaciones.', 'info');
      return;
    }

    try {
      const hasText = typeof content === 'string' && content.trim().length > 0;
      const contentToSend = hasText ? content : ' ';
      const maybeType = media ? (media.type.startsWith('video/') ? 'VIDEO' : media.type.startsWith('image/') ? 'IMAGE' : undefined) : undefined;

      const payload: any = { content: contentToSend };
      if (maybeType) payload.type = maybeType;

      const { data: postResp } = await api.post('/posts', payload);
      const postId = postResp?.data?.id || postResp?.id;

      let newPost = {
        ...postResp.data,
        comments: Array.isArray(postResp.data?.comments) ? postResp.data.comments : [],
        likes: typeof postResp.data?.likes === 'number' ? postResp.data.likes : 0,
        mediaUrl: postResp.data?.mediaURL ?? postResp.data?.mediaUrl ?? null,
        mediaURL: postResp.data?.mediaURL ?? postResp.data?.mediaUrl ?? null,
        mediaType: postResp.data?.mediaType ?? null,
      };

      if (media && postId) {
        try {
          const form = new FormData();
          form.append('file', media);
          const uploadResp = await api.put(`/files/uploadPostFile/${postId}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const updated = uploadResp.data;
          let mediaType: 'image' | 'video' | null = null;
          if (updated.type === 'VIDEO') mediaType = 'video';
          else if (updated.type === 'IMAGE') mediaType = 'image';
          newPost = {
            ...newPost,
            type: updated.type || newPost.type,
            mediaUrl: updated.mediaURL ?? updated.mediaUrl ?? null,
            mediaURL: updated.mediaURL ?? updated.mediaUrl ?? null,
            mediaType,
            user: updated.user || newPost.user,
          };
        } catch (uploadErr) {
          console.warn('Error subiendo archivo:', uploadErr);
          showAlert('No se pudo subir el archivo, pero el post se creó igual', 'info');
        }
      }

      setPosts((prev) => [newPost, ...prev]);
      showAlert('Publicación creada correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al crear post:', err);
      showAlert('Error al crear publicación ❌', 'error');
    }
  };

  // ✅ Like post (solo con token)
  const likePost = async (id: string) => {
    const token = tokenStore.getAccess();
    if (!token) {
      showAlert('Debes iniciar sesión para dar like.', 'info');
      return;
    }

    try {
      const { data } = await api.post(`/posts/${id}/like`);
      let serverCount = Number(data?.likeCount ?? data?.likes ?? 0);
      if (!Number.isFinite(serverCount) || serverCount < 0) {
        const { data: c } = await api.get(`/posts/${id}/likes`);
        serverCount = Number(c?.likeCount ?? 0);
      }
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: serverCount, likedByMe: true } : p)));
    } catch (err: any) {
      if (err.response?.status === 401) {
        showAlert('Tu sesión expiró. Iniciá sesión nuevamente.', 'info');
        tokenStore.clear();
        window.location.href = '/login';
      } else {
        console.error('Error al actualizar like:', err);
        showAlert('No se pudo actualizar el like ❌', 'error');
      }
    }
  };

  const addComment = async (postId: string, text: string) => {
    const token = tokenStore.getAccess();
    if (!token) {
      showAlert('Debes iniciar sesión para comentar.', 'info');
      return;
    }

    try {
      const { data } = await api.post(`/comment/post/${postId}`, { content: text });
      let comment: any = data?.data ?? data;
      if (!comment?.author && user) {
        comment = {
          ...comment,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          },
        };
      }
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)));
      showAlert('Comentario agregado correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al comentar:', err);
      showAlert('Error al agregar comentario ❌', 'error');
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const { data } = await api.post(`/comment/${commentId}/like`);
      const message = data?.message ?? '';
      const delta = String(message).toLowerCase().includes('removed') ? -1 : 1;
      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          comments: (p.comments || []).map((c) => (c.id === commentId ? { ...c, likeCount: Math.max(0, (c.likeCount || 0) + delta) } : c)),
        }))
      );
      showAlert(delta > 0 ? 'Like agregado ✅' : 'Like quitado ✅', 'success');
    } catch (err) {
      console.error('Error al actualizar like del comentario:', err);
      showAlert('Error al actualizar like ❌', 'error');
    }
  };

  //  Reportar post
  const reportPost = async (postId: string, reason: string, description?: string) => {
    try {
      await api.post('/reports', {
        postId,
        reason,
        description,
      });
      showAlert('Reporte enviado correctamente. Será revisado por los administradores ✅', 'success');
    } catch (err) {
      console.error('Error al reportar post:', err);
      showAlert('Error al enviar el reporte ❌', 'error');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { deletePost: deletePostService } = await import('../services/postService');
      await deletePostService(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showAlert('Publicación eliminada correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al borrar post:', err);
      showAlert('Error al eliminar publicación ❌', 'error');
    }
  };

  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    fetchPosts();
    const interval = setInterval(() => refreshPostsSilently(), 10000);
    return () => clearInterval(interval);
  }, [fetchPosts, refreshPostsSilently]);

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
        deletePost,
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
