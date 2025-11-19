"use client";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import SearchUserModal from "@/components/chat/SearchUserModal";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import {useState, useEffect} from "react";
import {useAuth} from "@/hook/useAuth";
import {useChat} from "@/context/ChatContext";
import {useSocket} from "@/hook/useSocket";
import {tokenStore} from "@/services/tokenStore";
import {useChatConversations} from "@/hook/chat/useChatConversations";
import {useChatMessages} from "@/hook/chat/useChatMessages";
import {useChatCache} from "@/hook/chat/useChatCache";
import {convertMessage, convertGroupToConversation} from "@/utils/chat/conversationHelpers";
import {Message as BackendMessage, MessageType, getDisplayName} from "@/services/chatService";
import type {Message, Conversation} from "@/interfaces/chat";
import Swal from "sweetalert2";

// Tipo para evento de grupo creado
type GroupCreatedEvent = {
  group: any; // Puede ser tipado mejor si tienes la interfaz
};

// Re-exportar interfaces para mantener compatibilidad con componentes
export type {Message, Participant, Conversation} from "@/interfaces/chat";

export default function ChatPage() {
  // Estado para manejar si el sidebar está visible en móvil
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  // Restaurar conversación seleccionada desde localStorage
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chat_selected_conversation") || null;
    }
    return null;
  });

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const {user} = useAuth();
  const {markMessagesAsRead, markConversationAsRead: markConversationAsReadGlobal} = useChat();

  // Verificar si el chat está habilitado
  const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false";

  const token = tokenStore.getAccess();
  const socket = useSocket({
    token: token || null,
    enabled: !!user && !!token,
  });

  // Hooks personalizados
  const cache = useChatCache();
  const {conversations, setConversations, loading, chatAvailable, loadConversations, openConversation} =
    useChatConversations({
      userId: user?.id,
      chatEnabled,
    });
  const {clearLoadedFlag} = useChatMessages({
    selectedConversationId,
    userId: user?.id,
    conversations,
    setConversations,
  });

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 🔔 Escuchar eventos de sincronización entre chat flotante y página /chat
  useEffect(() => {
    const handleChatSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const {conversationId, action} = customEvent.detail || {};

      if (action === "read" && conversationId) {
        // Marcar localmente la conversación como leída
        setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? {...conv, unreadCount: 0} : conv)));
      }
    };

    window.addEventListener("chat-sync", handleChatSync);
    return () => window.removeEventListener("chat-sync", handleChatSync);
  }, [setConversations]);

  // Cuando seleccionas una conversación, resetear el contador de mensajes no leídos
  useEffect(() => {
    if (selectedConversationId) {
      // Guardar en localStorage para persistir la selección
      localStorage.setItem("chat_selected_conversation", selectedConversationId);

      // Marcar la conversación como leída usando el ChatContext (sincroniza automáticamente)
      markConversationAsReadGlobal(selectedConversationId);

      // También actualizar localmente
      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversationId ? {...conv, unreadCount: 0} : conv))
      );

      // En móvil, cerrar el sidebar cuando seleccionas una conversación
      setIsMobileSidebarOpen(false);
    }
  }, [selectedConversationId, markConversationAsReadGlobal, setConversations]);

  // Escuchar evento de grupo creado por WebSocket
  useEffect(() => {
    if (!socket.isConnected || !socket.onGroupCreated) return;
    const cleanup = socket.onGroupCreated((group: any) => {
      setConversations((prev) => {
        if (prev.some((c) => c.id === group.id)) return prev;
        const groupConv = convertGroupToConversation(group);
        return [groupConv, ...prev];
      });
    });
    return cleanup;
  }, [socket, socket.isConnected, setConversations]);

  // Unirse a la conversación seleccionada
  useEffect(() => {
    if (selectedConversationId && socket.isConnected) {
      socket.joinConversation(selectedConversationId);
    }
  }, [selectedConversationId, socket]);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket.isConnected || !user?.id) return;

    const cleanup = socket.onMessageReceived((message: BackendMessage) => {
      const frontendMessage = convertMessage(message, user.id);
      const convId = message.conversation.id;

      // Si es un mensaje de grupo, limpiar el flag de carga para permitir recargar
      clearLoadedFlag(convId);

      setConversations((prev) => {
        // Buscar la conversación
        const conv = prev.find((c) => c.id === convId);

        // Si la conversación NO existe, crearla (puede ser grupo o 1:1)
        if (!conv) {
          // Detectar si es grupo por la estructura del mensaje (solo si existe participants)
          const isGroup =
            Array.isArray((message.conversation as any).participants) &&
            (message.conversation as any).participants.length > 2;
          let newConversation: Conversation;
          if (isGroup) {
            // Usar helper para asegurar estructura correcta y agregar el mensaje recibido
            const baseGroupConv = convertGroupToConversation(message.conversation as any);
            newConversation = {
              ...baseGroupConv,
              messages: [frontendMessage],
              lastMessage: frontendMessage.content,
              lastMessageTime: frontendMessage.timestamp,
              unreadCount: frontendMessage.isOwn ? 0 : 1,
            };
          } else {
            // Conversación 1:1
            const otherUserInfo = frontendMessage.isOwn
              ? null
              : {
                  userId: frontendMessage.senderId,
                  userName: frontendMessage.senderName,
                  userAvatar: frontendMessage.senderAvatar,
                };
            if (!frontendMessage.isOwn) {
              cache.saveUserToCache(frontendMessage.senderId, {
                name: frontendMessage.senderName,
                avatar: frontendMessage.senderAvatar,
              });
              cache.saveConversationUserMapping(convId, frontendMessage.senderId);
            }
            newConversation = {
              id: convId,
              userId: otherUserInfo?.userId,
              userName: otherUserInfo?.userName || "Conversación",
              userAvatar: otherUserInfo?.userAvatar,
              lastMessage: frontendMessage.content,
              lastMessageTime: frontendMessage.timestamp,
              unreadCount: frontendMessage.isOwn ? 0 : 1,
              messages: [frontendMessage],
              isGroup: false,
            };
          }
          return [newConversation, ...prev];
        }

        // La conversación existe, actualizarla
        return prev.map((conv) => {
          if (conv.id === convId) {
            // Si no hay mensajes cargados, inicializar el array
            const currentMessages = Array.isArray(conv.messages) ? conv.messages : [];

            // Si es mi propio mensaje, buscar mensaje temporal para reemplazarlo
            if (frontendMessage.isOwn) {
              const tempMessageIndex = currentMessages.findIndex((m) => m.tempId);
              if (tempMessageIndex !== -1) {
                const updatedMessages = [...currentMessages];
                updatedMessages[tempMessageIndex] = frontendMessage;
                return {
                  ...conv,
                  messages: updatedMessages,
                  lastMessage: frontendMessage.content,
                  lastMessageTime: frontendMessage.timestamp,
                };
              }
            }

            // Verificar si el mensaje ya existe
            const exists = currentMessages.some((m) => m.id === frontendMessage.id && !m.id.startsWith("temp-"));
            if (exists) return conv;

            const shouldIncrementUnread = !frontendMessage.isOwn && conv.id !== selectedConversationId;

            return {
              ...conv,
              messages: [...currentMessages, frontendMessage],
              lastMessage: frontendMessage.content,
              lastMessageTime: frontendMessage.timestamp,
              unreadCount: shouldIncrementUnread ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
            };
          }
          return conv;
        });
      });
    });

    return cleanup;
  }, [socket.isConnected, socket, user, selectedConversationId, cache, clearLoadedFlag, setConversations]);

  // Escuchar confirmaciones de mensajes enviados
  useEffect(() => {
    if (!socket.isConnected || !user?.id) return;

    const cleanup = socket.onMessageDelivered((message: BackendMessage) => {
      const frontendMessage = convertMessage(message, user.id);
      const convId = message.conversation.id;

      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.tempId && m.tempId === frontendMessage.tempId ? frontendMessage : m
              ),
            };
          }
          return conv;
        });
      });
    });

    return cleanup;
  }, [socket.isConnected, socket, user, setConversations]);

  // Marcar mensajes como leídos al entrar a la página
  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  // Selección de conversación
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Crear nueva conversación con un usuario
  const handleCreateConversation = async (selectedUser: {id: string; name: string; avatar?: string; email: string}) => {
    try {
      const conv = await openConversation(selectedUser);
      if (conv) {
        setSelectedConversationId(conv.id);
      }
    } catch (error) {
      console.error("Error al crear conversación:", error);
      Swal.fire("Error al crear la conversación");
    }
  };

  // Manejar grupo recién creado
  const handleGroupCreated = async (group: any) => {
    try {
      const groupConv = convertGroupToConversation(group);
      setConversations((prev) => [groupConv, ...prev]);
      setSelectedConversationId(group.id);
    } catch (error) {
      console.error("❌ Error al procesar grupo creado:", error);
      await loadConversations();
      setSelectedConversationId(group.id);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !content.trim() || !user?.id) return;

    const conv = conversations.find((c) => c.id === selectedConversationId);
    if (!conv) return;

    // Datos del usuario
    const cached = cache.getUserFromCache(user.id);
    let userAvatar = user.profilePicture;
    let userName = getDisplayName(user);
    if (cached) {
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

    // Agregar mensaje temporal (tanto para grupo como 1:1)
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConversationId) {
          return {
            ...c,
            messages: [...c.messages, tempMessage],
            lastMessage: content.trim(),
            lastMessageTime: new Date(),
          };
        }
        return c;
      })
    );

    // Enviar por WebSocket (funciona tanto para grupo como 1:1)
    const sent = socket.sendMessage({
      conversationId: selectedConversationId,
      type: MessageType.TEXT,
      content: content.trim(),
    });

    if (!sent) {
      console.error("No se pudo enviar el mensaje, socket desconectado");
      //alert("Error: No hay conexión con el servidor");

      // Remover el mensaje temporal
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedConversationId) {
            return {
              ...c,
              messages: c.messages.filter((m) => m.id !== tempId),
            };
          }
          return c;
        })
      );
      return;
    }
  };

  // Eliminar conversación
  const handleDeleteConversation = async (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const confirmMsg = conv.isGroup
      ? `¿Eliminar el grupo "${conv.groupName}"?`
      : `¿Eliminar conversación con ${conv.userName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (conv.isGroup) {
        const {deleteGroup, leaveGroup} = await import("@/services/chatService");
        if (conv.participants?.some((p: any) => p.id === user?.id && p.role === "ADMIN")) {
          await deleteGroup(conversationId);
        } else {
          await leaveGroup(conversationId);
        }
      } else {
        const {deleteConversation} = await import("@/services/chatService");
        await deleteConversation(conversationId);
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (e: any) {
      Swal.fire("Error al eliminar la conversación o grupo");
    }
  };

  if (!chatEnabled || !chatAvailable) {
    return (
      <div className="fixed top-16 left-0 md:left-64 right-0 bottom-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat no disponible</h2>
          <p className="text-gray-600 dark:text-gray-400">El módulo de chat no está habilitado en este momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-0 md:left-65 right-0 bottom-0 flex bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar con lista de conversaciones - Se oculta en móvil cuando hay conversación seleccionada */}
      <div className={`${isMobileSidebarOpen ? "block" : "hidden"} md:block w-full md:w-80 shrink-0 h-full`}>
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        />
      </div>

      {/* Ventana de chat - Se muestra en toda la pantalla en móvil cuando hay conversación seleccionada */}
      <div className={`${!isMobileSidebarOpen ? "block" : "hidden"} md:block flex-1 relative h-full`}>
        {/* Botón de volver en móvil */}
        {selectedConversation && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
            aria-label="Volver a conversaciones"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}

        <ChatWindow
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Modal de búsqueda de usuarios */}
      <SearchUserModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={handleCreateConversation}
        currentUserId={user?.id || ""}
      />

      {/* Modal de creación de grupo */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
