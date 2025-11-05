'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '../hook/useAuth';

interface ChatContextType {
  unreadMessagesCount: number;
  hasNewMessages: boolean;
  markMessagesAsRead: () => void;
  refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { user } = useAuth();

  // Función para obtener el conteo de mensajes no leídos
  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadMessagesCount(0);
      setHasNewMessages(false);
      return;
    }

    try {
      // TODO: Aquí deberías hacer una petición al backend para obtener
      // el conteo real de mensajes no leídos
      // Ejemplo:
      // const { data } = await api.get('/messages/unread-count');
      // setUnreadMessagesCount(data.count);

      // Por ahora, usamos datos de ejemplo del localStorage
      const storedCount = localStorage.getItem('unreadMessagesCount');
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      setUnreadMessagesCount(count);
      setHasNewMessages(count > 0);
    } catch (error) {
      console.error('Error al obtener mensajes no leídos:', error);
    }
  }, [user]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = useCallback(() => {
    setUnreadMessagesCount(0);
    setHasNewMessages(false);
    localStorage.setItem('unreadMessagesCount', '0');
  }, []);

  // Simular recepción de nuevos mensajes (esto se reemplazará con WebSocket/polling real)
  useEffect(() => {
    if (!user) return;

    refreshUnreadCount();

    // Verificar nuevos mensajes cada 10 segundos
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  return (
    <ChatContext.Provider
      value={{
        unreadMessagesCount,
        hasNewMessages,
        markMessagesAsRead,
        refreshUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat debe usarse dentro de un ChatProvider');
  return context;
};
