'use client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import SearchUserModal from '@/components/chat/SearchUserModal';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hook/useAuth';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/hook/useSocket';
import { tokenStore } from '@/services/tokenStore';
import { getUserConversations, openConversation, getMessages, Message as BackendMessage, Conversation as BackendConversation, MessageType, getDisplayName, getOtherParticipant } from '@/services/chatService';

// Interfaces para el frontend
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  tempId?: string; // ID temporal para mensajes optimistas
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Conversation {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  isGroup?: boolean;
  groupName?: string;
  participants?: Participant[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatAvailable, setChatAvailable] = useState(true);
  const { user } = useAuth();
  const { markMessagesAsRead } = useChat();

  // Verificar si el chat está habilitado
  const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED !== 'false';

  const token = tokenStore.getAccess();
  const socket = useSocket({
    token: token || null,
    enabled: !!user && !!token,
  });

  // Cache de información de usuarios para persistir entre recargas
  const getUserCache = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const cached = localStorage.getItem('chat_users_cache');
    return cached ? JSON.parse(cached) : {};
  }, []);

  const getConversationCache = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const cached = localStorage.getItem('chat_conversations_cache');
    return cached ? JSON.parse(cached) : {};
  }, []);

  const getUserFromCache = useCallback(
    (userId: string) => {
      const cache = getUserCache();
      return cache[userId];
    },
    [getUserCache]
  );

  const saveUserToCache = useCallback(
    (userId: string, userData: { name: string; avatar?: string }) => {
      if (typeof window === 'undefined') return;
      const cache = getUserCache();
      cache[userId] = userData;
      localStorage.setItem('chat_users_cache', JSON.stringify(cache));
    },
    [getUserCache]
  );

  const saveConversationUserMapping = useCallback(
    (conversationId: string, userId: string) => {
      if (typeof window === 'undefined') return;
      const cache = getConversationCache();
      cache[conversationId] = userId;
      localStorage.setItem('chat_conversations_cache', JSON.stringify(cache));
    },
    [getConversationCache]
  );

  const getUserIdFromConversation = useCallback(
    (conversationId: string) => {
      const cache = getConversationCache();
      return cache[conversationId];
    },
    [getConversationCache]
  );

  // Guardar datos del usuario actual en cache cuando esté disponible
  useEffect(() => {
    if (user?.id && user?.name) {
      const userData = {
        name: user.name + (user.lastName ? ` ${user.lastName}` : ''),
        avatar: user.profilePicture || undefined,
      };
      saveUserToCache(user.id, userData);
    }
  }, [user, saveUserToCache]);

  // Convertir mensaje del backend a formato del frontend
  const convertMessage = useCallback(
    (msg: BackendMessage, currentUserId: string): Message => {
      let senderAvatar = msg.sender?.profilePicture;
      let senderName = msg.sender ? getDisplayName(msg.sender) : 'Usuario';
      const senderId = msg.sender?.id || '';

      // Si el mensaje tiene sender con avatar, guardarlo en cache
      if (senderId && msg.sender.profilePicture) {
        saveUserToCache(senderId, {
          name: senderName,
          avatar: msg.sender.profilePicture,
        });
      }

      // Si no tiene avatar, buscar en cache
      if (senderId && !senderAvatar) {
        const cached = getUserFromCache(senderId);
        if (cached) {
          senderAvatar = cached.avatar;
          senderName = cached.name || senderName;
        }
      }

      const isOwn = senderId === currentUserId;

      // Debug: verificar comparación
      if (process.env.NODE_ENV === 'development') {
        console.log('convertMessage:', { senderId, currentUserId, isOwn, messageContent: msg.content });
      }

      return {
        id: msg.id,
        senderId,
        senderName,
        senderAvatar: senderAvatar || undefined,
        content: msg.content || msg.mediaUrl || '',
        timestamp: new Date(msg.createdAt),
        isOwn,
      };
    },
    [saveUserToCache, getUserFromCache]
  );

  // Convertir conversación del backend a formato del frontend
  const convertConversation = useCallback(
    (conv: BackendConversation, currentUserId: string): Conversation => {
      // Intentar obtener el otro usuario desde participants
      let otherUser = getOtherParticipant(conv, currentUserId);

      // Si no hay participants (el backend no los incluye), obtener del primer mensaje
      if (!otherUser && conv.messages && conv.messages.length > 0) {
        const otherMessage = conv.messages.find((msg) => msg.sender?.id !== currentUserId);
        if (otherMessage?.sender) {
          otherUser = otherMessage.sender;
        }
      }

      const messages = (conv.messages || []).map((msg) => convertMessage(msg, currentUserId));
      const lastMsg = messages[messages.length - 1];

      // Contar mensajes no leídos
      const unreadCount = (conv.messages || []).filter((msg) => msg.sender?.id !== currentUserId && !msg.isRead).length;

      // Obtener userId del otro usuario
      let userId = otherUser?.id;

      // Si no tenemos userId, intentar sacarlo de los mensajes
      if (!userId && messages.length > 0) {
        const otherMessage = messages.find((msg) => !msg.isOwn);
        if (otherMessage) {
          userId = otherMessage.senderId;
        }
      }

      // Si aún no tenemos userId, buscar en el mapeo de conversaciones
      if (!userId) {
        userId = getUserIdFromConversation(conv.id);
      }

      // Intentar obtener info del usuario
      let userName = otherUser ? getDisplayName(otherUser) : undefined;
      let userAvatar = otherUser?.profilePicture;

      // Si no tenemos info completa y tenemos userId, buscar en cache
      if (userId && (!userName || userName === 'Conversación')) {
        const cached = getUserFromCache(userId);
        if (cached) {
          userName = cached.name;
          userAvatar = cached.avatar;
        }
      } // Si aún no tenemos nombre, usar fallback
      if (!userName) {
        userName = 'Conversación';
      }

      // Debug: verificar avatar en conversación
      if (process.env.NODE_ENV === 'development') {
        console.log('Conversation avatar:', {
          conversationId: conv.id,
          userName,
          userAvatar,
          otherUser: otherUser ? { id: otherUser.id, profilePicture: otherUser.profilePicture } : null,
        });
      }

      return {
        id: conv.id,
        userId,
        userName,
        userAvatar: userAvatar || undefined,
        lastMessage: lastMsg?.content || '',
        lastMessageTime: lastMsg?.timestamp || new Date(conv.updatedAt),
        unreadCount,
        messages,
        isGroup: false,
      };
    },
    [convertMessage, getUserFromCache, getUserIdFromConversation]
  ); // Cargar conversaciones del usuario
  const loadConversations = useCallback(async () => {
    if (!user?.id || !chatEnabled) return;

    try {
      setLoading(true);
      const backendConvs = await getUserConversations();

      // Debug: verificar qué llega del backend
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend conversations:', backendConvs);
        if (backendConvs[0]?.messages[0]) {
          console.log('Sample message from backend:', backendConvs[0].messages[0]);
        }
      }

      const frontendConvs = backendConvs.map((conv) => convertConversation(conv, user.id));

      // Ordenar por última actividad
      frontendConvs.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      setConversations(frontendConvs);
      setChatAvailable(true);
    } catch (error: any) {
      console.error('Error al cargar conversaciones:', error);
      if (error?.response?.status === 404) {
        setChatAvailable(false);
      }
    } finally {
      setLoading(false);
    }
  }, [user, chatEnabled, convertConversation]);

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Unirse a la conversación seleccionada
  useEffect(() => {
    if (selectedConversationId && socket.isConnected) {
      socket.joinConversation(selectedConversationId);
    }
  }, [selectedConversationId, socket.isConnected, socket]);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket.isConnected || !user?.id) return;

    const cleanup = socket.onMessageReceived((message: BackendMessage) => {
      const frontendMessage = convertMessage(message, user.id);
      const convId = message.conversation.id;
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === convId) {
            // Preservar información del otro usuario o actualizarla
            let otherUserInfo = {
              userId: conv.userId,
              userName: conv.userName,
              userAvatar: conv.userAvatar,
            };

            // Si el mensaje es del otro usuario y no teníamos su info, guardarla
            if (!frontendMessage.isOwn) {
              if (!otherUserInfo.userId || otherUserInfo.userName === 'Conversación') {
                otherUserInfo = {
                  userId: frontendMessage.senderId,
                  userName: frontendMessage.senderName,
                  userAvatar: frontendMessage.senderAvatar,
                };
                // Guardar en cache
                saveUserToCache(frontendMessage.senderId, {
                  name: frontendMessage.senderName,
                  avatar: frontendMessage.senderAvatar,
                });
                // Guardar mapeo conversación→usuario
                saveConversationUserMapping(convId, frontendMessage.senderId);
              }
            } else {
              // Si es mi propio mensaje, también guardar mi info en cache
              if (frontendMessage.senderAvatar) {
                saveUserToCache(frontendMessage.senderId, {
                  name: frontendMessage.senderName,
                  avatar: frontendMessage.senderAvatar,
                });
              }
            }

            // Si es mi propio mensaje, buscar mensaje temporal para reemplazarlo
            if (frontendMessage.isOwn) {
              const tempMessageIndex = conv.messages.findIndex((m) => m.tempId && m.id.startsWith('temp-'));

              if (tempMessageIndex !== -1) {
                // Reemplazar el mensaje temporal con el real
                const updatedMessages = [...conv.messages];
                updatedMessages[tempMessageIndex] = frontendMessage;
                return {
                  ...conv,
                  ...otherUserInfo,
                  messages: updatedMessages,
                  lastMessage: frontendMessage.content,
                  lastMessageTime: frontendMessage.timestamp,
                };
              }
            }

            // Verificar si el mensaje ya existe (por ID real del backend)
            const exists = conv.messages.some((m) => m.id === frontendMessage.id && !m.id.startsWith('temp-'));
            if (exists) return conv;

            // Agregar nuevo mensaje
            return {
              ...conv,
              ...otherUserInfo,
              messages: [...conv.messages, frontendMessage],
              lastMessage: frontendMessage.content,
              lastMessageTime: frontendMessage.timestamp,
              unreadCount: frontendMessage.isOwn ? conv.unreadCount : conv.unreadCount + 1,
            };
          }
          return conv;
        });
      });
    });

    return cleanup;
  }, [socket.isConnected, socket, user, convertMessage]);

  // Escuchar confirmaciones de mensajes enviados
  useEffect(() => {
    if (!socket.isConnected || !user?.id) return;

    const cleanup = socket.onMessageDelivered((message: BackendMessage) => {
      const frontendMessage = convertMessage(message, user.id);
      const convId = message.conversation.id;

      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === convId) {
            // Reemplazar mensaje temporal por el mensaje real
            return {
              ...conv,
              messages: conv.messages.map((m) => (m.tempId && m.tempId === frontendMessage.tempId ? frontendMessage : m)),
            };
          }
          return conv;
        });
      });
    });

    return cleanup;
  }, [socket.isConnected, socket, user, convertMessage]);

  // Marcar mensajes como leídos al entrar a la página
  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Crear nueva conversación con un usuario
  const handleCreateConversation = async (selectedUser: { id: string; name: string; avatar?: string; email: string }) => {
    if (!user?.id) return;

    try {
      // Verificar si ya existe una conversación con este usuario
      const existingConv = conversations.find((c) => !c.isGroup && c.userId === selectedUser.id);

      if (existingConv) {
        // Si ya existe, solo la seleccionamos
        setSelectedConversationId(existingConv.id);
        return;
      }

      // Crear nueva conversación en el backend
      const backendConv = await openConversation(selectedUser.id);
      const frontendConv = convertConversation(backendConv, user.id);

      // Asegurarse de que tiene la info del usuario seleccionado
      const conversationWithUserInfo = {
        ...frontendConv,
        userId: selectedUser.id,
        userName: selectedUser.name,
        userAvatar: selectedUser.avatar,
      };

      // Guardar en cache
      saveUserToCache(selectedUser.id, {
        name: selectedUser.name,
        avatar: selectedUser.avatar,
      });

      // Guardar mapeo conversación→usuario
      saveConversationUserMapping(backendConv.id, selectedUser.id);

      setConversations((prev) => [conversationWithUserInfo, ...prev]);
      setSelectedConversationId(conversationWithUserInfo.id);
    } catch (error) {
      console.error('Error al crear conversación:', error);
      alert('Error al crear la conversación');
    }
  };

  // Enviar mensaje
  const handleSendMessage = (content: string) => {
    if (!selectedConversationId || !content.trim() || !user?.id) return;

    // Primero buscar en cache, luego en user object
    const cached = getUserFromCache(user.id);
    let userAvatar = user.profilePicture;
    let userName = getDisplayName(user);

    if (cached) {
      // Usar datos del cache si están disponibles
      userAvatar = cached.avatar || userAvatar;
      userName = cached.name || userName;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      tempId,
      senderId: user.id,
      senderName: userName,
      senderAvatar: userAvatar || undefined,
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    // Agregar mensaje optimísticamente
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, tempMessage],
            lastMessage: content.trim(),
            lastMessageTime: new Date(),
          };
        }
        return conv;
      })
    );

    // Enviar por WebSocket
    const sent = socket.sendMessage({
      conversationId: selectedConversationId,
      type: MessageType.TEXT,
      content: content.trim(),
    });

    if (!sent) {
      // Si el socket no está conectado, mostrar error
      console.error('No se pudo enviar el mensaje, socket desconectado');
      alert('Error: No hay conexión con el servidor');

      // Remover el mensaje temporal
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: conv.messages.filter((m) => m.id !== tempId),
            };
          }
          return conv;
        })
      );
    }
  };

  // Eliminar conversación (solo visual - local)
  const handleDeleteConversation = (conversationId: string) => {
    if (!confirm('¿Deseas ocultar esta conversación?')) return;

    // Remover la conversación del estado local (solo visual)
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));

    // Si era la conversación seleccionada, deseleccionarla
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-400 absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si el chat no está disponible
  if (!chatEnabled || !chatAvailable) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-full inline-block mb-6">
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chat próximamente</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">La funcionalidad de mensajería instantánea estará disponible muy pronto. Estamos trabajando para habilitarla en el backend.</p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-yellow-500">💡 Nota para desarrolladores:</strong>
              <br />
              El backend necesita ser actualizado con el módulo de chat. Una vez desplegado en Render, cambiar <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_CHAT_ENABLED</code> a <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">true</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      {/* Indicador de conexión */}
      {!socket.isConnected && user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">⚠️ Reconectando al servidor de chat...</p>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto border-x border-gray-200 dark:border-gray-700">
        {/* Sidebar con lista de conversaciones */}
        <ChatSidebar conversations={conversations} selectedId={selectedConversationId} onSelectConversation={setSelectedConversationId} onOpenSearch={() => setIsSearchModalOpen(true)} />

        {/* Ventana de chat */}
        <ChatWindow conversation={selectedConversation} onSendMessage={handleSendMessage} onDeleteConversation={handleDeleteConversation} />
      </div>

      {/* Modal de búsqueda de usuarios */}
      <SearchUserModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={(selectedUser) => {
          handleCreateConversation(selectedUser);
          setIsSearchModalOpen(false);
        }}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
