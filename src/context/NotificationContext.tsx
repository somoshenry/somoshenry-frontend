'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hook/useAuth';
import { useSocket } from '../hook/useSocket';
import { tokenStore } from '../services/tokenStore';
import { getSystemNotifications, markSystemNotificationAsRead, SystemNotification } from '../services/notificationService';

export interface Notification {
  id: string;
  type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT_POST' | 'REPLY_COMMENT' | 'NEW_FOLLOWER' | 'NEW_MESSAGE' | 'COHORTE_INVITATION' | 'system';
  receiverId?: string;
  senderId?: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  metadata?: {
    postId?: string;
    postContent?: string;
    commentId?: string;
    commentContent?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
  // Campos legacy para notificaciones del sistema
  systemType?: string;
  systemTitle?: string;
  systemMessage?: string;
  // Campos calculados para compatibilidad
  authorName?: string;
  authorAvatar?: string;
  postId?: string;
  postContent?: string;
  commentContent?: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // WebSocket para notificaciones en tiempo real
  const handleRealtimeNotification = useCallback((notification: any) => {
    console.log('🔔 Nueva notificación en tiempo real:', notification);

    // Convertir notificación del WebSocket al formato local
    const newNotification: Notification = {
      id: notification.id || `realtime-${Date.now()}`,
      type: notification.type || 'system',
      postId: notification.postId,
      postContent: notification.postContent,
      authorName: notification.authorName || 'Sistema',
      authorAvatar: notification.authorAvatar,
      commentContent: notification.commentContent,
      createdAt: notification.createdAt || new Date().toISOString(),
      read: false,
      isRead: false,
      systemType: notification.systemType,
      systemTitle: notification.systemTitle,
      systemMessage: notification.systemMessage,
      metadata: notification.metadata,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
    };

    // Agregar a la lista de notificaciones
    setNotifications((prev) => [newNotification, ...prev]);

    // Si es asignación de cohorte, disparar evento para recargar sidebar
    if (notification.type === 'COHORTE_INVITATION') {
      console.log('🎓 Disparando evento de cohorte asignada');
      globalThis.dispatchEvent(new CustomEvent('notification:cohorte_assigned'));
    }

    // Mostrar notificación del navegador si está permitido
    if (typeof globalThis !== 'undefined' && 'Notification' in globalThis && Notification.permission === 'granted') {
      const notifTitle = notification.type === 'COHORTE_INVITATION' ? '🎓 Nueva cohorte asignada' : notification.systemTitle || '¡Nueva notificación!';

      const notifBody = notification.type === 'COHORTE_INVITATION' ? `Has sido asignado como ${notification.metadata?.role} a ${notification.metadata?.cohorteName}` : notification.systemMessage || notification.postContent || 'Tienes una nueva notificación';

      new Notification(notifTitle, {
        body: notifBody,
        icon: notification.authorAvatar || '/avatars/default.svg',
      });
    }
  }, []);

  const token = tokenStore.getAccess();
  useSocket({
    token,
    enabled: !!user && !!token,
    onNotification: handleRealtimeNotification,
  });

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
    type: 'LIKE_POST',
    postId: post.id,
    postContent: post.content || '(sin contenido)',
    authorName: like.user?.name || like.user?.email?.split?.('@')?.[0] || 'Alguien',
    authorAvatar: like.user?.profilePicture,
    createdAt: like.createdAt || new Date().toISOString(),
    read: false,
    isRead: false,
  });

  // Normaliza un like en comentario
  const toCommentLikeNotification = (like: any, post: any, comment: any): Notification => ({
    id: `comment-like-${like.id}`,
    type: 'LIKE_COMMENT',
    postId: post.id,
    postContent: post.content || '(sin contenido)',
    authorName: like.user?.name || like.user?.email?.split?.('@')?.[0] || 'Alguien',
    authorAvatar: like.user?.profilePicture,
    commentContent: comment.content,
    createdAt: like.createdAt || new Date().toISOString(),
    read: false,
    isRead: false,
  });

  // Función para obtener notificaciones desde el backend
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Obtener notificaciones del endpoint real
      const { data: backendNotifications } = await api.get('/notifications');

      const built: Notification[] = [];

      // Procesar notificaciones del backend
      if (Array.isArray(backendNotifications)) {
        for (const notif of backendNotifications) {
          // Normalizar la notificación para el formato del frontend
          const normalized: Notification = {
            id: notif.id,
            type: notif.type,
            receiverId: notif.receiverId,
            senderId: notif.senderId,
            sender: notif.sender,
            metadata: notif.metadata || {},
            isRead: notif.isRead || false,
            createdAt: notif.createdAt,
            // Campos calculados para compatibilidad
            authorName: notif.sender?.name || notif.sender?.email?.split('@')[0] || 'Usuario',
            authorAvatar: notif.sender?.profilePicture,
            postId: notif.metadata?.postId,
            postContent: notif.metadata?.postContent,
            commentContent: notif.metadata?.commentContent,
            read: notif.isRead || false,
          };
          built.push(normalized);
        }
      }

      // Agregar notificaciones del sistema
      const systemNotifs = getSystemNotifications(user.id);
      for (const sn of systemNotifs) {
        built.push({
          id: sn.id,
          type: 'system',
          isRead: sn.read,
          createdAt: sn.createdAt,
          authorName: 'Sistema',
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

      // Ordenar por fecha descendente
      built.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(built);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      // Si falla el endpoint, intentar cargar solo notificaciones del sistema
      if (process.env.NODE_ENV === 'development') {
        console.warn('Endpoint de notificaciones no disponible, mostrando solo notificaciones del sistema');
      }
      const systemNotifs = getSystemNotifications(user.id);
      const systemOnly = systemNotifs.map((sn) => ({
        id: sn.id,
        type: 'system' as const,
        isRead: sn.read,
        createdAt: sn.createdAt,
        authorName: 'Sistema',
        read: sn.read,
        systemType: sn.type,
        systemTitle: sn.title,
        systemMessage: sn.message,
      }));
      setNotifications(systemOnly);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Marcar notificación como leída
  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);

      // Si es notificación del sistema
      if (notification?.type === 'system') {
        if (user) markSystemNotificationAsRead(user.id, id);
      } else {
        // Notificación del backend
        await api.patch(`/notifications/${id}/read`);
      }

      // Actualizar localmente
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      // Fallback: actualizar solo localmente
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      // Marcar todas en el backend
      await api.patch('/notifications/read-all');

      // Marcar notificaciones del sistema
      if (user) {
        notifications.forEach((n) => {
          if (n.type === 'system') {
            markSystemNotificationAsRead(user.id, n.id);
          }
        });
      }

      // Actualizar localmente
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      // Fallback: actualizar solo localmente
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    }
  };

  // Contador de no leídas
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

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
    globalThis.addEventListener('systemNotification', handleSystemNotification);

    return () => {
      clearInterval(interval);
      globalThis.removeEventListener('systemNotification', handleSystemNotification);
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
