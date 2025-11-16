import { useEffect, useRef, useCallback } from 'react';
import { Conversation, Message } from '@/interfaces/chat';
import { getGroupMessages, GroupMessage, getDisplayName, sendGroupMessage as sendGroupMessageService, MessageType } from '@/services/chatService';

interface UseChatMessagesProps {
  selectedConversationId: string | null;
  userId: string | undefined;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

/**
 * Hook para manejar la carga y envío de mensajes de grupos
 */
export function useChatMessages({ selectedConversationId, userId, conversations, setConversations }: UseChatMessagesProps) {
  // Ref para trackear qué grupos ya tienen mensajes cargados
  const loadedGroupMessagesRef = useRef<Set<string>>(new Set());

  /**
   * Carga los mensajes de un grupo desde el backend
   */
  const loadGroupMessages = useCallback(
    async (conversationId: string) => {
      if (!userId) return;

      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv?.isGroup) return;

      // Si ya cargamos los mensajes de este grupo, no recargar
      // (a menos que el array esté vacío, lo que indica que necesitamos cargar)
      if (loadedGroupMessagesRef.current.has(conv.id) && conv.messages.length > 0) {
        console.log('⏭️ Mensajes del grupo ya cargados, saltando:', conv.id);
        return;
      }

      try {
        console.log('🔄 Cargando mensajes del grupo:', conv.id);
        const response = await getGroupMessages(conv.id, 1, 50);

        // Adaptar mensajes de grupo al formato del frontend
        const msgs: Message[] = response.data.map((msg: GroupMessage) => ({
          id: msg.id,
          senderId: msg.sender.id,
          senderName: getDisplayName(msg.sender),
          senderAvatar: msg.sender.profilePicture || undefined,
          content: msg.content || msg.mediaUrl || '',
          timestamp: new Date(msg.createdAt),
          isOwn: msg.sender.id === userId,
        }));

        // Marcar como cargado
        loadedGroupMessagesRef.current.add(conv.id);

        // Actualizar la conversación con los mensajes cargados
        // Combinar con mensajes locales que tengan tempId (mensajes optimistas)
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conv.id) {
              // Mantener mensajes temporales (optimistas) que aún no están confirmados
              const tempMessages = c.messages.filter((m) => m.tempId && !msgs.some((msg) => msg.id === m.id));
              // Combinar mensajes del servidor con mensajes temporales
              return { ...c, messages: [...msgs, ...tempMessages] };
            }
            return c;
          })
        );
      } catch (e) {
        console.error('❌ Error al cargar mensajes del grupo:', e);
      }
    },
    [userId, conversations, setConversations]
  );

  /**
   * Envía un mensaje a un grupo
   */
  const sendGroupMessage = useCallback(
    async (groupId: string, content: string) => {
      if (!userId) return;
      try {
        // Enviar mensaje al backend (el WebSocket notificará a todos los miembros)
        return await sendGroupMessageService({
          groupId,
          content: content.trim(),
          type: MessageType.TEXT,
        });
      } catch (e) {
        console.error('❌ Error al enviar mensaje al grupo:', e);
        throw e;
      }
    },
    [userId]
  );

  /**
   * Limpia el flag de mensajes cargados para un grupo (útil cuando llega un mensaje nuevo)
   */
  const clearLoadedFlag = useCallback((conversationId: string) => {
    loadedGroupMessagesRef.current.delete(conversationId);
  }, []);

  // Cargar mensajes cuando se selecciona un grupo
  useEffect(() => {
    if (selectedConversationId) {
      loadGroupMessages(selectedConversationId);
    }
  }, [selectedConversationId, conversations.length, loadGroupMessages]);

  return {
    loadGroupMessages,
    sendGroupMessage,
    clearLoadedFlag,
  };
}
