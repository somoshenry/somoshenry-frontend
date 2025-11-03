'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { tokenStore } from '../services/tokenStore';
import { PostType } from '../interfaces/interfaces.post/post';
import { useAlert } from './AlertContext';
import { string } from 'yup';
import { useAuth } from '../hook/useAuth';

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

export const PostContext = createContext<PostContextType | null>(null);

// Evita doble fetch en desarrollo sin bloquear remounts entre rutas/HMR
// Usamos un ref dentro del provider en lugar de una variable de módulo

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const hasMountedRef = useRef(false);

  // Función auxiliar para normalizar un post
  const normalizePost = async (p: PostType) => {
    try {
      // Intentar cargar comentarios del post
      const commentsResponse = await api.get(`/post/${p.id}/comments`);
      const rawComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
      // Derivar likedByMe en comentarios si backend trae 'likes' con userId
      const currentUserId = user?.id;
      const comments = rawComments.map((c: any) => {
        const liked = Array.isArray(c?.likes) && currentUserId ? c.likes.some((l: any) => l?.userId === currentUserId) : false;
        return { ...c, likedByMe: liked };
      });
      // Obtener contador de likes del post desde el backend para que persista entre recargas
      let likeCount = 0;
      try {
        const likesResp = await api.get(`/posts/${p.id}/likes`);
        likeCount = Number(likesResp.data?.likeCount ?? 0);
      } catch (e) {
        likeCount = 0; // fallback silencioso
      }

      // Determinar mediaType basándose en el tipo de post o la URL
      let mediaType: 'image' | 'video' | null = null;
      if (p.type === 'VIDEO') {
        mediaType = 'video';
      } else if (p.type === 'IMAGE') {
        mediaType = 'image';
      } else if (p.mediaURL || p.mediaUrl) {
        // Fallback: detectar por extensión de archivo
        const url = p.mediaURL || p.mediaUrl || '';
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.mkv', '.m4v'];
        const isVideo = videoExtensions.some((ext) => url.toLowerCase().includes(ext));
        mediaType = isVideo ? 'video' : 'image';
      }

      return {
        ...p,
        comments: comments,
        likes: likeCount,
        // Compatibilidad con ambos campos de media
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaURL: p.mediaURL || p.mediaUrl || null,
        mediaType: mediaType,
        // Estado local para resaltar el botón (no persiste):
        likedByMe: false as unknown as boolean,
      };
    } catch (err) {
      // Si falla la carga de comentarios, continuar con array vacío
      console.warn(`No se pudieron cargar comentarios del post ${p.id}`, err);

      // Aún así intentar detectar el tipo de media
      let mediaType: 'image' | 'video' | null = null;
      if (p.type === 'VIDEO') {
        mediaType = 'video';
      } else if (p.type === 'IMAGE') {
        mediaType = 'image';
      } else if (p.mediaURL || p.mediaUrl) {
        const url = p.mediaURL || p.mediaUrl || '';
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.mkv', '.m4v'];
        const isVideo = videoExtensions.some((ext) => url.toLowerCase().includes(ext));
        mediaType = isVideo ? 'video' : 'image';
      }

      return {
        ...p,
        comments: [],
        likes: 0,
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaURL: p.mediaURL || p.mediaUrl || null,
        mediaType: mediaType,
        likedByMe: false as unknown as boolean,
      };
    }
  };

  // Obtiene y normaliza los posts del backend (con loading visible)
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;

      // Cargar comentarios para cada post
      const postsWithComments = await Promise.all((postsArray || []).map(normalizePost));

      setPosts(postsWithComments);
    } catch (err) {
      console.error('Error al cargar posts:', err);
      showAlert('Error al cargar publicaciones ❌', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert, user?.id]);

  // Refresco silencioso: reobtiene y reemplaza la lista sin mostrar loading
  const refreshPostsSilently = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      const postsArray = Array.isArray(data) ? data : data.data;
      const normalized = await Promise.all((postsArray || []).map(normalizePost));
      setPosts(normalized);
    } catch (err) {
      // silencioso
      console.warn('Error refrescando publicaciones (silencioso):', err);
    }
  }, [user?.id]);

  //  Crear un nuevo post
  const addPost = async (content: string, media?: File | null) => {
    try {
      // 1. Crear el post (sin mediaURL)
      const { data: postResp } = await api.post('/posts', { content });
      const postId = postResp?.data?.id || postResp?.id;
      let newPost = {
        ...postResp.data,
        comments: Array.isArray(postResp.data?.comments) ? postResp.data.comments : [],
        likes: typeof postResp.data?.likes === 'number' ? postResp.data.likes : 0,
        mediaUrl: postResp.data?.mediaURL ?? postResp.data?.mediaUrl ?? null,
        mediaURL: postResp.data?.mediaURL ?? postResp.data?.mediaUrl ?? null,
        mediaType: postResp.data?.mediaType ?? null,
      };

      // 2. Si hay archivo, subirlo a /files/uploadPostFile/:postId
      if (media && postId) {
        try {
          const form = new FormData();
          form.append('file', media);
          const uploadResp = await api.put(`/files/uploadPostFile/${postId}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          // El backend actualiza el post y devuelve el post actualizado
          const updated = uploadResp.data;

          // Detectar tipo de media desde el archivo o la respuesta del backend
          let mediaType: 'image' | 'video' | null = null;
          if (updated.type === 'VIDEO') {
            mediaType = 'video';
          } else if (updated.type === 'IMAGE') {
            mediaType = 'image';
          } else if (media.type.startsWith('video/')) {
            mediaType = 'video';
          } else if (media.type.startsWith('image/')) {
            mediaType = 'image';
          }

          newPost = {
            ...newPost,
            type: updated.type || newPost.type,
            mediaUrl: updated.mediaURL ?? updated.mediaUrl ?? null,
            mediaURL: updated.mediaURL ?? updated.mediaUrl ?? null,
            mediaType: mediaType,
            user: updated.user || newPost.user, // Asegura usuario correcto si backend lo retorna
          };
        } catch (uploadErr) {
          console.warn('Error subiendo archivo a Cloudinary:', uploadErr);
          showAlert('No se pudo subir el archivo, pero el post se creó igual', 'info');
        }
      }

      // Refresca el post desde el backend para asegurar datos completos (usuario, media, etc)
      let finalPost = newPost;
      try {
        if (postId) {
          const { data: fresh } = await api.get(`/posts/${postId}`);

          // Detectar tipo de media
          let mediaType: 'image' | 'video' | null = null;
          if (fresh.type === 'VIDEO') {
            mediaType = 'video';
          } else if (fresh.type === 'IMAGE') {
            mediaType = 'image';
          } else if (fresh.mediaURL || fresh.mediaUrl) {
            const url = fresh.mediaURL || fresh.mediaUrl || '';
            const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.mkv', '.m4v'];
            const isVideo = videoExtensions.some((ext) => url.toLowerCase().includes(ext));
            mediaType = isVideo ? 'video' : 'image';
          }

          finalPost = {
            ...fresh,
            comments: Array.isArray(fresh?.comments) ? fresh.comments : [],
            likes: typeof fresh?.likes === 'number' ? fresh.likes : 0,
            mediaUrl: fresh?.mediaURL ?? fresh?.mediaUrl ?? null,
            mediaURL: fresh?.mediaURL ?? fresh?.mediaUrl ?? null,
            mediaType: mediaType,
          };
        }
      } catch (refreshErr) {
        // Si falla, usa el newPost
      }

      // Completa datos de usuario localmente si no vinieron del backend
      if (!finalPost.user && user) {
        finalPost = {
          ...finalPost,
          user: {
            id: user.id,
            name: user.name || undefined,
            lastName: user.lastName || undefined,
            email: user.email,
            avatar: user.profilePicture || '',
            profilePicture: user.profilePicture || null,
          } as any,
        } as any;
      }

      setPosts((prev) => [finalPost, ...prev]);
      showAlert('Publicación creada correctamente ✅', 'success');
    } catch (err) {
      console.error('Error al crear post:', err);
      showAlert('Error al crear publicación ❌', 'error');
    }
  };

  //  Like en un post
  const likePost = async (id: string) => {
    try {
      // Requiere autenticación
      const token = tokenStore.getAccess();
      if (!token) {
        showAlert('Debes iniciar sesión para dar like', 'info');
        return;
      }

      // Intentar dar like primero
      try {
        const { data } = await api.post(`/posts/${id}/like`);
        let serverCount = Number(data?.likeCount ?? data?.likes ?? 0);
        // Si el backend no devolvió el contador, lo consultamos
        if (!Number.isFinite(serverCount) || serverCount < 0) {
          try {
            const { data: c } = await api.get(`/posts/${id}/likes`);
            serverCount = Number(c?.likeCount ?? 0);
          } catch {}
        }
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: serverCount, likedByMe: true as unknown as boolean } : p)));
        return;
      } catch (err: any) {
        // Si ya tenía like, intentamos hacer unlike como toggle
        const msg = err?.response?.data?.message || err?.message || '';
        const status = err?.response?.status;

        // Intento de fallback a unlike si: ya estaba likeado, o error 409/400, o incluso 500 por validación interna
        const shouldTryUnlike = String(msg).toLowerCase().includes('ya diste like') || status === 409 || status === 400 || status === 500;

        if (shouldTryUnlike) {
          try {
            const { data } = await api.delete(`/posts/${id}/unlike`);
            let serverCount = Number(data?.likeCount ?? 0);
            if (!Number.isFinite(serverCount) || serverCount < 0) {
              try {
                const { data: c } = await api.get(`/posts/${id}/likes`);
                serverCount = Number(c?.likeCount ?? 0);
              } catch {}
            }
            setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: serverCount, likedByMe: false as unknown as boolean } : p)));
            return;
          } catch (unlikeErr) {
            // seguimos abajo al handler genérico
            throw unlikeErr;
          }
        }

        // Otros errores
        throw err;
      }
    } catch (err) {
      console.error('Error al actualizar like del post:', err);
      showAlert('No se pudo actualizar el like ❌', 'error');
    }
  };

  const addComment = async (postId: string, text: string) => {
    try {
      const { data } = await api.post(`/comment/post/${postId}`, { content: text });

      // Algunos backends devuelven { data }, otros el comentario directo
      let comment: any = data?.data ?? data;

      // Si no viene el autor completo, completarlo con el usuario logueado
      if (!comment?.author && user) {
        comment = {
          ...comment,
          author: {
            id: user.id,
            name: user.name || undefined,
            lastName: user.lastName || undefined,
            email: user.email,
            avatar: user.profilePicture || '',
            profilePicture: user.profilePicture || null,
          },
        };
      }
      // Defaults de campos usados en UI
      if (!comment.createdAt) comment.createdAt = new Date().toISOString();
      if (typeof comment.likeCount !== 'number') comment.likeCount = 0;

      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)));

      showAlert('Comentario agregado correctamente ✅', 'success');
    } catch (err) {
      showAlert('Error al agregar comentario ❌', 'error');
      console.error('Error al comentar:', err);
    }
  };

  //  Like a comentario
  const likeComment = async (commentId: string) => {
    try {
      const { data } = await api.post(`/comment/${commentId}/like`);
      const message: string = data?.message ?? '';
      const delta = String(message).toLowerCase().includes('removed') || String(message).toLowerCase().includes('quit') ? -1 : 1;

      // Actualizar localmente el contador de likes del comentario (+1 o -1)
      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          comments: (p.comments || []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likeCount: Math.max(0, (c.likeCount || 0) + delta),
                  likedByMe: delta > 0,
                }
              : c
          ),
        }))
      );

      showAlert(delta > 0 ? 'Like agregado al comentario ✅' : 'Like quitado del comentario ✅', 'success');
    } catch (err) {
      console.error('Error al actualizar like del comentario:', err);
      showAlert('Error al actualizar like del comentario ❌', 'error');
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

  //  Carga inicial y refresco silencioso periódicamente
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Carga inicial
    fetchPosts();

    // Refresco silencioso cada 10s para ver nuevos posts de otros usuarios
    const interval = setInterval(() => {
      refreshPostsSilently();
    }, 10000);

    return () => clearInterval(interval);
    // Intencionado: sin dependencias para no re-registrar el intervalo
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
