import { api } from './api';

/**
 * Tipos de notificaciones del sistema
 */
export enum SystemNotificationType {
  POST_DELETED_SPAM = 'POST_DELETED_SPAM',
  POST_DELETED_INAPPROPRIATE = 'POST_DELETED_INAPPROPRIATE',
  POST_DELETED_HARASSMENT = 'POST_DELETED_HARASSMENT',
  POST_DELETED_MISINFORMATION = 'POST_DELETED_MISINFORMATION',
  POST_DELETED_OTHER = 'POST_DELETED_OTHER',
  REPORT_THANK_YOU = 'REPORT_THANK_YOU',
  COMMENT_DELETED = 'COMMENT_DELETED',
}

export interface SystemNotification {
  id: string;
  userId: string;
  type: SystemNotificationType;
  title: string;
  message: string;
  metadata?: {
    postId?: string;
    postContent?: string;
    reason?: string;
    reportId?: string;
  };
  read: boolean;
  createdAt: string;
}

/**
 * Crea una notificación del sistema para un usuario
 * Por ahora se almacena en localStorage hasta que tengamos backend
 */
export function createSystemNotification(userId: string, type: SystemNotificationType, title: string, message: string, metadata?: SystemNotification['metadata']): void {
  try {
    const notificationsKey = `system_notifications_${userId}`;
    const stored = localStorage.getItem(notificationsKey);
    const notifications: SystemNotification[] = stored ? JSON.parse(stored) : [];

    const newNotification: SystemNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      metadata,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(newNotification);

    // Mantener solo las últimas 100 notificaciones
    const trimmed = notifications.slice(0, 100);

    localStorage.setItem(notificationsKey, JSON.stringify(trimmed));

    // Disparar evento para actualizar UI
    window.dispatchEvent(new CustomEvent('systemNotification', { detail: newNotification }));
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
}

/**
 * Obtiene las notificaciones del sistema para un usuario
 */
export function getSystemNotifications(userId: string): SystemNotification[] {
  try {
    const notificationsKey = `system_notifications_${userId}`;
    const stored = localStorage.getItem(notificationsKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting system notifications:', error);
    return [];
  }
}

/**
 * Marca una notificación como leída
 */
export function markSystemNotificationAsRead(userId: string, notificationId: string): void {
  try {
    const notificationsKey = `system_notifications_${userId}`;
    const stored = localStorage.getItem(notificationsKey);
    const notifications: SystemNotification[] = stored ? JSON.parse(stored) : [];

    const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));

    localStorage.setItem(notificationsKey, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Cuenta las notificaciones no leídas
 */
export function getUnreadSystemNotificationsCount(userId: string): number {
  const notifications = getSystemNotifications(userId);
  return notifications.filter((n) => !n.read).length;
}

/**
 * Helper: Notifica al autor que su post fue eliminado
 */
export function notifyPostDeleted(authorId: string, reason: string, postContent: string, postId: string): void {
  const reasonMap: Record<string, { title: string; type: SystemNotificationType }> = {
    SPAM: {
      title: 'Post oculto por Spam',
      type: SystemNotificationType.POST_DELETED_SPAM,
    },
    INAPPROPRIATE: {
      title: 'Post oculto por contenido inapropiado',
      type: SystemNotificationType.POST_DELETED_INAPPROPRIATE,
    },
    HARASSMENT: {
      title: 'Post oculto por acoso',
      type: SystemNotificationType.POST_DELETED_HARASSMENT,
    },
    MISINFORMATION: {
      title: 'Post oculto por desinformación',
      type: SystemNotificationType.POST_DELETED_MISINFORMATION,
    },
    OTHER: {
      title: 'Post oculto',
      type: SystemNotificationType.POST_DELETED_OTHER,
    },
  };

  const config = reasonMap[reason] || reasonMap.OTHER;

  const message = `Tu publicación ha sido ocultada por violar nuestras políticas de la comunidad. Ya no aparecerá en el feed público. Razón: ${reason === 'SPAM' ? 'Spam' : reason === 'INAPPROPRIATE' ? 'Contenido inapropiado' : reason === 'HARASSMENT' ? 'Acoso' : reason === 'MISINFORMATION' ? 'Desinformación' : 'Otros motivos'}.`;

  createSystemNotification(authorId, config.type, config.title, message, {
    postId,
    postContent: postContent.substring(0, 100),
    reason,
  });
}

/**
 * Helper: Agradece a los reportadores por su contribución
 */
export function notifyReportersThankYou(reporterIds: string[], postContent: string): void {
  reporterIds.forEach((reporterId) => {
    createSystemNotification(reporterId, SystemNotificationType.REPORT_THANK_YOU, 'Gracias por reportar', 'Gracias por ayudar a mantener nuestra comunidad segura. Tu reporte fue revisado y se tomaron las medidas apropiadas.', {
      postContent: postContent.substring(0, 100),
    });
  });
}
