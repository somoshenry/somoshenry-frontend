'use client';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { formatDateArgentina } from '@/utils/dateFormatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: Props) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // Navegar según el tipo de notificación
    if (notification.type === 'COHORTE_INVITATION' && notification.metadata?.cohorteId) {
      router.push(`/cohorte/${notification.metadata.cohorteId}`);
    } else if (notification.postId) {
      router.push(`/home`); // Podrías navegar a `/post/${postId}` si tienes esa ruta
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Notificaciones</h3>
        {notifications.length > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} onClick={() => handleNotificationClick(notification)} className={`p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {notification.type !== 'system' && <img src={notification.authorAvatar || '/avatars/default.svg'} alt={notification.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />}
                {notification.type === 'system' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xl">🔔</span>
                  </div>
                )}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  {notification.type === 'system' ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.systemTitle}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{notification.systemMessage}</p>
                      {notification.postContent && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{notification.postContent}"</p>}
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">{notification.authorName}</span>
                        {notification.type === 'LIKE_POST' && <span className="text-gray-700 dark:text-gray-300"> le dio like a tu publicación</span>}
                        {notification.type === 'COMMENT_POST' && <span className="text-gray-700 dark:text-gray-300"> comentó en tu publicación</span>}
                        {notification.type === 'LIKE_COMMENT' && <span className="text-gray-700 dark:text-gray-300"> le dio like a tu comentario</span>}
                        {notification.type === 'REPLY_COMMENT' && <span className="text-gray-700 dark:text-gray-300"> respondió a tu comentario</span>}
                        {notification.type === 'NEW_FOLLOWER' && <span className="text-gray-700 dark:text-gray-300"> comenzó a seguirte</span>}
                        {notification.type === 'NEW_MESSAGE' && <span className="text-gray-700 dark:text-gray-300"> te envió un mensaje</span>}
                        {notification.type === 'COHORTE_ASSIGNED' && (
                          <span className="text-gray-700 dark:text-gray-300">
                            Has sido asignado como <span className="font-semibold">{notification.metadata?.role}</span> a la cohorte <span className="font-semibold text-blue-600 dark:text-blue-400">{notification.metadata?.cohorteName}</span>
                          </span>
                        )}
                      </p>

                      {/* Preview del post */}
                      {notification.postContent && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{notification.postContent}</p>}

                      {/* Si es comentario o like a comentario, mostrar el texto del comentario */}
                      {(notification.type === 'COMMENT_POST' || notification.type === 'LIKE_COMMENT' || notification.type === 'REPLY_COMMENT') && notification.commentContent && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">"{notification.commentContent}"</p>}
                    </>
                  )}

                  {/* Fecha */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateArgentina(notification.createdAt)}</p>
                </div>

                {/* Indicador de no leído */}
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
