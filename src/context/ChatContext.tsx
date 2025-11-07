'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '../hook/useAuth';
import { useSocket } from '../hook/useSocket';
import { getUserConversations, Message } from '@/services/chatService';
import { tokenStore } from '@/services/tokenStore';

interface ChatContextType {
  unreadMessagesCount: number;
  hasNewMessages: boolean;
  markMessagesAsRead: () => void;
  refreshUnreadCount: () => void;
  isSocketConnected: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { user } = useAuth();

  // Verificar si el chat está habilitado
  const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED !== 'false';

  // Obtener token para WebSocket
  const token = tokenStore.getAccess();

  // Conectar al WebSocket solo si el chat está habilitado
  const socket = useSocket({
    token: token || null,
    enabled: chatEnabled && !!user && !!token,
  });

  // Función para obtener el conteo de mensajes no leídos
  const refreshUnreadCount = useCallback(async () => {
    if (!user || !chatEnabled) {
      setUnreadMessagesCount(0);
      setHasNewMessages(false);
      return;
    }

    try {
      // Obtener todas las conversaciones del usuario
      const conversations = await getUserConversations();

      // Contar mensajes no leídos (mensajes donde el sender no es el usuario actual y no están leídos)
      let totalUnread = 0;
      conversations.forEach((conv) => {
        const unreadInConv = conv.messages.filter((msg: Message) => msg.sender?.id !== user?.id && !msg.isRead).length;
        totalUnread += unreadInConv;
      });

      setUnreadMessagesCount(totalUnread);
      setHasNewMessages(totalUnread > 0);
    } catch (error: any) {
      // Si el módulo de chat no está disponible (404), no hacer nada
      if (error?.response?.status === 404) {
        console.log('ℹ️ Módulo de chat no disponible en el backend');
        setUnreadMessagesCount(0);
        setHasNewMessages(false);
        return;
      }
      console.error('Error al obtener mensajes no leídos:', error);
    }
  }, [user, chatEnabled]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = useCallback(() => {
    setUnreadMessagesCount(0);
    setHasNewMessages(false);
  }, []);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket.isConnected) return;

    const cleanup = socket.onMessageReceived((message: Message) => {
      // Si el mensaje no es del usuario actual, incrementar contador
      if (message.sender.id !== user?.id) {
        setUnreadMessagesCount((prev) => prev + 1);
        setHasNewMessages(true);
      }
    });

    return cleanup;
  }, [socket.isConnected, socket, user]);

  // Actualizar contador al montar y cada 30 segundos
  useEffect(() => {
    if (!user) return;

    refreshUnreadCount();

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // cada 30 segundos

    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  return (
    <ChatContext.Provider
      value={{
        unreadMessagesCount,
        hasNewMessages,
        markMessagesAsRead,
        refreshUnreadCount,
        isSocketConnected: socket.isConnected,
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
