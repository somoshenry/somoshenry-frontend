'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hook/useAuth';
import { getSystemNotifications, markSystemNotificationAsRead, SystemNotification } from '../services/notificationService';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'comment-like' | 'system';
  postId?: string;
  postContent?: string;
  authorName: string;
  authorAvatar?: string;
  commentContent?: string;
  createdAt: string;
  read: boolean;
  // Para notificaciones del sistema
  systemType?: string;
  systemTitle?: string;
  systemMessage?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Persistencia local para estado de lectura y contadores vistos (fallback por conteo)
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [seenPostLikeCounts, setSeenPostLikeCounts] = useState<Record<string, number>>({}); // postId -> count
  const [seenCommentLikeCounts, setSeenCommentLikeCounts] = useState<Record<string, number>>({}); // commentId -> count

  // Helpers de persistencia
  const persistReadIds = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem('notif_read_ids', JSON.stringify(Array.from(ids)));
    } catch {}
  }, []);

  const persistSeenCounts = useCallback((key: string, obj: Record<string, number>) => {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch {}
  }, []);

  // Cargar persistencia al montar
  useEffect(() => {
    try {
      const rawRead = localStorage.getItem('notif_read_ids');
      if (rawRead) setReadIds(new Set(JSON.parse(rawRead)));
    } catch {}
    try {
      const rawPostCounts = localStorage.getItem('notif_seen_post_like_counts');
      if (rawPostCounts) setSeenPostLikeCounts(JSON.parse(rawPostCounts));
    } catch {}
    try {
      const rawCommentCounts = localStorage.getItem('notif_seen_comment_like_counts');
      if (rawCommentCounts) setSeenCommentLikeCounts(JSON.parse(rawCommentCounts));
    } catch {}
  }, []);

  // Normaliza un like-array con estructura opcional de usuario
  const toLikeNotification = (like: any, post: any): Notification => ({
    id: `post-like-${like.id}`,
    type: 'like',
    postId: post.id,
    postContent: post.content || '(sin contenido)',
    authorName: like.user?.name || like.user?.email?.split?.('@')?.[0] || 'Alguien',
    authorAvatar: like.user?.profilePicture,
    createdAt: like.createdAt || new Date().toISOString(),
    read: false,
  });

  // Normaliza un like en comentario
  const toCommentLikeNotification = (like: any, post: any, comment: any): Notification => ({
    id: `comment-like-${like.id}`,
    type: 'comment-like',
    postId: post.id,
    postContent: post.content || '(sin contenido)',
    authorName: like.user?.name || like.user?.email?.split?.('@')?.[0] || 'Alguien',
    authorAvatar: like.user?.profilePicture,
    commentContent: comment.content,
    createdAt: like.createdAt || new Date().toISOString(),
    read: false,
  });

  // Función para obtener notificaciones desde el backend
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Obtener todos los posts del usuario
      const { data: postsData } = await api.get('/posts');
      const allPosts = Array.isArray(postsData) ? postsData : postsData.data || [];
      const userPosts = allPosts.filter((p: any) => p.userId === user.id);

      const built: Notification[] = [];

      // 2. Para cada post del usuario, revisar likes y comentarios
      for (const post of userPosts) {
        // Obtener likes del post
        try {
          const { data: likesData } = await api.get(`/posts/${post.id}/likes`);
          const likesArray = Array.isArray(likesData?.likes) ? likesData.likes : null;
          // Caso A: el backend devuelve el array de likes con usuarios
          if (likesArray) {
            const otherUserLikes = likesArray.filter((like: any) => like.userId !== user.id);
            for (const like of otherUserLikes) {
              built.push(toLikeNotification(like, post));
            }
          } else {
            // Caso B: solo devuelve likeCount -> generar notificación agregada si aumentó
            const count = Number(likesData?.likeCount ?? 0);
            const seen = Number(seenPostLikeCounts[post.id] ?? 0);
            if (count > seen) {
              built.push({
                id: `post-like-${post.id}-${count}`,
                type: 'like',
                postId: post.id,
                postContent: post.content || '(sin contenido)',
                authorName: count - seen === 1 ? 'Alguien' : `${count - seen} usuarios`,
                authorAvatar: undefined,
                createdAt: new Date().toISOString(),
                read: false,
              });
            }
          }
        } catch (err) {
          console.warn(`Error al cargar likes del post ${post.id}`, err);
        }

        // Obtener comentarios del post
        try {
          const { data: commentsData } = await api.get(`/post/${post.id}/comments`);
          const comments = Array.isArray(commentsData) ? commentsData : [];

          // Filtrar comentarios que NO sean del propio usuario
          const otherUserComments = comments.filter((comment: any) => comment.author?.id !== user.id);

          for (const comment of otherUserComments) {
            built.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              postId: post.id,
              postContent: post.content || '(sin contenido)',
              authorName: comment.author?.name || 'Usuario',
              authorAvatar: comment.author?.profilePicture,
              commentContent: comment.content,
              createdAt: comment.createdAt || new Date().toISOString(),
              read: false,
            });
          }

          // Notificaciones por likes en comentarios
          for (const comment of comments) {
            // Ignorar likes propios
            const cLikesArray = Array.isArray(comment?.likes) ? comment.likes : null;
            if (cLikesArray) {
              const otherUserLikes = cLikesArray.filter((like: any) => like.userId !== user.id);
              for (const like of otherUserLikes) {
                built.push(toCommentLikeNotification(like, post, comment));
              }
            } else {
              // Fallback por conteo si no hay array de likes
              const cCount = Number(comment?.likeCount ?? 0);
              const seenC = Number(seenCommentLikeCounts[comment.id] ?? 0);
              if (cCount > seenC) {
                built.push({
                  id: `comment-like-${comment.id}-${cCount}`,
                  type: 'comment-like',
                  postId: post.id,
                  postContent: post.content || '(sin contenido)',
                  authorName: cCount - seenC === 1 ? 'Alguien' : `${cCount - seenC} usuarios`,
                  authorAvatar: undefined,
                  commentContent: comment.content,
                  createdAt: new Date().toISOString(),
                  read: false,
                });
              }
            }
          }
        } catch (err) {
          console.warn(`Error al cargar comentarios del post ${post.id}`, err);
        }
      }

      // Agregar notificaciones del sistema
      const systemNotifs = getSystemNotifications(user.id);
      for (const sn of systemNotifs) {
        built.push({
          id: sn.id,
          type: 'system',
          authorName: 'Sistema',
          createdAt: sn.createdAt,
          read: sn.read,
          systemType: sn.type,
          systemTitle: sn.title,
          systemMessage: sn.message,
          postId: sn.metadata?.postId,
          postContent: sn.metadata?.postContent,
        });
      }

      // Deduplicar por id y re-aplicar estado de lectura persistido
      const uniqMap = new Map<string, Notification>();
      for (const n of built) {
        if (!uniqMap.has(n.id)) {
          uniqMap.set(n.id, { ...n, read: readIds.has(n.id) });
        }
      }
      const list = Array.from(uniqMap.values());
      // Ordenar por fecha más reciente
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(list);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [user, readIds, seenPostLikeCounts, seenCommentLikeCounts]);

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    // Si es una notificación del sistema, marcarla en su storage
    const notification = notifications.find((n) => n.id === id);
    if (notification?.type === 'system' && user) {
      markSystemNotificationAsRead(user.id, id);
    }

    // Persistir
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });

    // Si es una notificación agregada por conteo, actualizar 'seen' para no re-aparecer
    // Formatos soportados: post-like-<postId>-<count> | comment-like-<commentId>-<count>
    if (id.startsWith('post-like-')) {
      const parts = id.split('-');
      const postId = parts[2];
      const count = Number(parts[3]);
      if (postId && Number.isFinite(count)) {
        setSeenPostLikeCounts((prev) => {
          const next = { ...prev, [postId]: Math.max(count, Number(prev[postId] ?? 0)) };
          persistSeenCounts('notif_seen_post_like_counts', next);
          return next;
        });
      }
    }
    if (id.startsWith('comment-like-') && id.match(/^comment-like-[^-]+-\d+$/)) {
      const parts = id.split('-');
      const commentId = parts[2];
      const count = Number(parts[3]);
      if (commentId && Number.isFinite(count)) {
        setSeenCommentLikeCounts((prev) => {
          const next = { ...prev, [commentId]: Math.max(count, Number(prev[commentId] ?? 0)) };
          persistSeenCounts('notif_seen_comment_like_counts', next);
          return next;
        });
      }
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      persistReadIds(next);
      return next;
    });
    // Actualizar todos los contadores 'seen' a valores máximos actuales
    const postCounts = { ...seenPostLikeCounts };
    const commentCounts = { ...seenCommentLikeCounts };
    for (const n of notifications) {
      if (n.id.startsWith('post-like-')) {
        const parts = n.id.split('-');
        const postId = parts[2];
        const count = Number(parts[3]);
        if (postId && Number.isFinite(count)) postCounts[postId] = Math.max(count, Number(postCounts[postId] ?? 0));
      }
      if (n.id.startsWith('comment-like-') && n.id.match(/^comment-like-[^-]+-\d+$/)) {
        const parts = n.id.split('-');
        const commentId = parts[2];
        const count = Number(parts[3]);
        if (commentId && Number.isFinite(count)) commentCounts[commentId] = Math.max(count, Number(commentCounts[commentId] ?? 0));
      }
    }
    setSeenPostLikeCounts(postCounts);
    setSeenCommentLikeCounts(commentCounts);
    persistSeenCounts('notif_seen_post_like_counts', postCounts);
    persistSeenCounts('notif_seen_comment_like_counts', commentCounts);
  };

  // Contador de no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Cargar notificaciones al montar y cada 60 segundos
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Cada 60 segundos

    // Listener para notificaciones del sistema en tiempo real
    const handleSystemNotification = () => {
      fetchNotifications();
    };
    window.addEventListener('systemNotification', handleSystemNotification);

    return () => {
      clearInterval(interval);
      window.removeEventListener('systemNotification', handleSystemNotification);
    };
  }, [fetchNotifications, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  return context;
};
