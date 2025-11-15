import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, MessageType } from '@/services/chatService';

// URL del backend WebSocket
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UseSocketProps {
  token: string | null;
  enabled?: boolean;
  onNotification?: (notification: any) => void;
}

interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export function useSocket({ token, enabled = true, onNotification }: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Conectar al socket
  useEffect(() => {
    if (!enabled || !token) {
      // Desconectar si está deshabilitado o no hay token
      if (socketRef.current) {
        console.log('🔌 Desconectando socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Crear conexión
    console.log('🔌 Conectando al socket con token...');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Event listeners
    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      // Solo loguear en desarrollo, en producción silenciar
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ WebSocket no disponible (chat no activo)');
      }
      setIsConnected(false);
    });

    // Usuarios en línea
    socket.on('onlineUsers', (users: string[]) => {
      console.log('👥 Usuarios en línea actualizados:', users);
      setOnlineUsers(users);
    });

    // Notificaciones en tiempo real
    if (onNotification) {
      socket.on('notification', (notification: any) => {
        console.log('🔔 Notificación recibida:', notification);
        onNotification(notification);
      });
    }

    // Cleanup
    return () => {
      console.log('🧹 Limpiando socket...');
      socket.disconnect();
    };
  }, [token, enabled, onNotification]);

  // Unirse a una conversación
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket no conectado, no se puede unir a conversación');
      return;
    }
    console.log('📥 Uniéndose a conversación:', conversationId);
    socketRef.current.emit('joinConversation', { conversationId });
  }, []);

  // Enviar mensaje por WebSocket
  const sendMessage = useCallback((dto: { conversationId: string; type: MessageType; content?: string; mediaUrl?: string }) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket no conectado, no se puede enviar mensaje');
      return false;
    }
    console.log('📤 Enviando mensaje por WebSocket:', dto);
    socketRef.current.emit('sendMessage', dto);
    return true;
  }, []);

  // Indicar que está escribiendo
  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing', { conversationId, isTyping });
  }, []);

  // Marcar mensaje como leído
  const markAsRead = useCallback((messageId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('markAsRead', { messageId });
  }, []);

  // Escuchar eventos de mensajes
  const onMessageReceived = useCallback((callback: (message: Message) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (message: Message) => {
      console.log('📨 Mensaje recibido:', message);
      callback(message);
    };

    socketRef.current.on('messageReceived', handler);
    return () => {
      socketRef.current?.off('messageReceived', handler);
    };
  }, []);

  // Escuchar confirmación de mensaje enviado
  const onMessageDelivered = useCallback((callback: (message: Message) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (message: Message) => {
      console.log('✅ Mensaje entregado:', message);
      callback(message);
    };

    socketRef.current.on('messageDelivered', handler);
    return () => {
      socketRef.current?.off('messageDelivered', handler);
    };
  }, []);

  // Escuchar errores de mensaje
  const onMessageError = useCallback((callback: (error: { error: string }) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (error: { error: string }) => {
      console.error('❌ Error en mensaje:', error);
      callback(error);
    };

    socketRef.current.on('messageError', handler);
    return () => {
      socketRef.current?.off('messageError', handler);
    };
  }, []);

  // Escuchar cuando alguien está escribiendo
  const onUserTyping = useCallback((callback: (data: TypingData) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: TypingData) => {
      console.log('⌨️ Usuario escribiendo:', data);
      callback(data);
    };

    socketRef.current.on('userTyping', handler);
    return () => {
      socketRef.current?.off('userTyping', handler);
    };
  }, []);

  // Escuchar cuando se marca como leído
  const onMessageRead = useCallback((callback: (message: Message) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (message: Message) => {
      console.log('👁️ Mensaje marcado como leído:', message);
      callback(message);
    };

    socketRef.current.on('messageRead', handler);
    return () => {
      socketRef.current?.off('messageRead', handler);
    };
  }, []);

  // Escuchar evento de grupo creado
  const onGroupCreated = useCallback((callback: (group: any) => void) => {
    if (!socketRef.current) return () => {};
    const handler = (group: any) => {
      console.log('👥 Nuevo grupo recibido:', group);
      callback(group);
    };
    socketRef.current.on('groupCreated', handler);
    return () => {
      socketRef.current?.off('groupCreated', handler);
    };
  }, []);

  return {
    isConnected,
    onlineUsers,
    joinConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    onMessageReceived,
    onMessageDelivered,
    onMessageError,
    onUserTyping,
    onMessageRead,
    onGroupCreated,
  };
}
