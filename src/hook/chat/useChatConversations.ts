import { useState, useCallback } from 'react';
import { Conversation } from '@/interfaces/chat';
import { getUserConversations, getUserGroups, openConversation as openConversationService } from '@/services/chatService';
import { convertConversation, convertGroupToConversation } from '@/utils/chat/conversationHelpers';
import { saveUserToCache, saveConversationUserMapping } from '@/utils/chat/cacheHelpers';

interface UseChatConversationsProps {
  userId: string | undefined;
  chatEnabled: boolean;
}

/**
 * Hook para manejar la carga y gestión de conversaciones
 */
export function useChatConversations({ userId, chatEnabled }: UseChatConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatAvailable, setChatAvailable] = useState(true);

  /**
   * Carga todas las conversaciones (1:1 y grupos) del usuario
   */
  const loadConversations = useCallback(async () => {
    if (!userId || !chatEnabled) return;

    try {
      setLoading(true);
      const [backendConvs, groups] = await Promise.all([getUserConversations(), getUserGroups()]);

      // Convertir conversaciones 1:1
      const frontendConvs = backendConvs.map((conv) => convertConversation(conv, userId));

      // Convertir grupos a formato de conversación
      const groupConvs = groups.map((group) => convertGroupToConversation(group));

      // Unir y ordenar por fecha
      const allConvs = [...frontendConvs, ...groupConvs];
      allConvs.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      setConversations(allConvs);
      setChatAvailable(true);
    } catch (error: any) {
      console.error('Error al cargar conversaciones:', error);

      // Si el módulo de chat no está disponible (404), no es un error crítico
      if (error?.response?.status === 404) {
        console.log('ℹ️ Módulo de chat no disponible en el backend');
        setChatAvailable(false);
        setConversations([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, chatEnabled]);

  /**
   * Abre o crea una conversación 1:1 con un usuario
   */
  const openConversation = useCallback(
    async (selectedUser: { id: string; name: string; avatar?: string; email: string }) => {
      if (!userId) return null;

      try {
        // Verificar si ya existe una conversación con este usuario
        const existingConv = conversations.find((c) => !c.isGroup && c.userId === selectedUser.id);

        if (existingConv) {
          return existingConv;
        }

        // Crear nueva conversación en el backend
        const backendConv = await openConversationService(selectedUser.id);
        const frontendConv = convertConversation(backendConv, userId);

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

        saveConversationUserMapping(backendConv.id, selectedUser.id);

        // Agregar al estado
        setConversations((prev) => [conversationWithUserInfo, ...prev]);

        return conversationWithUserInfo;
      } catch (error) {
        console.error('Error al crear conversación:', error);
        throw error;
      }
    },
    [conversations, userId]
  );

  return {
    conversations,
    setConversations,
    loading,
    chatAvailable,
    loadConversations,
    openConversation,
  };
}
