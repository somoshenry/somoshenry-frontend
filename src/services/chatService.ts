import { api } from './api';

// ==================== TIPOS ====================

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  lastName?: string | null;
  username?: string | null;
  profilePicture?: string | null;
}

export interface Message {
  id: string;
  conversation: { id: string };
  sender: User;
  type: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMessages {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== FUNCIONES REST ====================

/**
 * Abre o crea una conversación con otro usuario
 */
export async function openConversation(peerUserId: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>('/chat/conversations', { peerUserId });
  return data;
}

/**
 * Obtiene todas las conversaciones del usuario actual
 */
export async function getUserConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>('/chat/conversations');
  return data;
}

/**
 * Obtiene los mensajes de una conversación (paginado)
 */
export async function getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedMessages> {
  const { data } = await api.get<PaginatedMessages>(`/chat/conversations/${conversationId}/messages`, { params: { page, limit } });
  return data;
}

/**
 * Envía un mensaje (HTTP - para mensajes con archivos o como fallback)
 */
export async function sendMessage(dto: { conversationId: string; type: MessageType; content?: string; mediaUrl?: string }): Promise<Message> {
  const { data } = await api.post<Message>('/chat/messages', dto);
  return data;
}

/**
 * Marca un mensaje como leído
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
  const { data } = await api.patch<Message>(`/chat/messages/${messageId}/read`);
  return data;
}

/**
 * Marca todos los mensajes de una conversación como leídos
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    // Obtener las conversaciones y encontrar los mensajes no leídos
    const conversations = await getUserConversations();
    const conversation = conversations.find((c) => c.id === conversationId);

    if (conversation) {
      // Marcar cada mensaje no leído
      const unreadMessages = conversation.messages.filter((msg) => !msg.isRead);
      await Promise.all(unreadMessages.map((msg) => markMessageAsRead(msg.id).catch(() => {})));
    }
  } catch (error) {
    console.error('Error al marcar conversación como leída:', error);
  }
}

/**
 * Sube un archivo multimedia para el chat
 */
export async function uploadChatMedia(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Enviando archivo:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const { data } = await api.post<{ url: string }>('/chat/upload', formData);

    console.log('✅ Respuesta del servidor:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error al subir archivo:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Elimina una conversación
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}

// ==================== HELPERS ====================

/**
 * Obtiene el nombre para mostrar de un usuario
 */
export function getDisplayName(user: User): string {
  if (user.name && user.lastName) {
    return `${user.name} ${user.lastName}`;
  }
  if (user.name) return user.name;
  if (user.username) return user.username;
  return user.email.split('@')[0];
}

/**
 * Obtiene las iniciales de un usuario
 */
export function getUserInitials(user: User): string {
  if (user.name && user.lastName) {
    return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user.name) return user.name.charAt(0).toUpperCase();
  if (user.username) return user.username.charAt(0).toUpperCase();
  return user.email.charAt(0).toUpperCase();
}

/**
 * Obtiene el otro participante en una conversación 1-a-1
 */
export function getOtherParticipant(conversation: Conversation, currentUserId: string): User | null {
  return conversation.participants.find((p) => p.id !== currentUserId) || null;
}

/**
 * Determina si un mensaje fue enviado por el usuario actual
 */
export function isOwnMessage(message: Message, currentUserId: string): boolean {
  return message.sender.id === currentUserId;
}
