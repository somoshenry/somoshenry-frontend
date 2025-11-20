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

// ==================== TIPOS DE GRUPO ====================

export interface ChatGroup {
  id: string;
  name: string;
  imageUrl?: string | null;
  members: User[];
  admins: User[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  id: string;
  group: { id: string };
  sender: User;
  type: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== FUNCIONES GRUPALES ====================

/**
 * Crea un grupo de chat
 */
export async function createGroup(dto: { name: string; userIds: string[]; imageUrl?: string; description?: string }): Promise<ChatGroup> {
  // El backend espera 'memberIds', no 'userIds'
  const payload = {
    name: dto.name,
    memberIds: dto.userIds,
    imageUrl: dto.imageUrl,
    description: dto.description,
  };
  const { data } = await api.post<ChatGroup>('/chat/groups', payload);
  return data;
}

/**
 * Obtiene los grupos del usuario actual
 */
export async function getUserGroups(): Promise<ChatGroup[]> {
  const { data } = await api.get<ChatGroup[]>('/chat/groups');
  return data;
}

/**
 * Envía un mensaje a un grupo
 */
export async function sendGroupMessage(dto: { groupId: string; content: string; type: MessageType }): Promise<GroupMessage> {
  // Usar la ruta específica para grupos: /chat/groups/:groupId/messages
  const { data } = await api.post<GroupMessage>(`/chat/groups/${dto.groupId}/messages`, {
    content: dto.content,
    type: dto.type,
  });
  return data;
}

/**
 * Obtiene los mensajes de un grupo (paginado)
 * NOTA: El backend usa la misma ruta para grupos y conversaciones 1:1
 * Ambos son tratados como "conversations" internamente
 */
export async function getGroupMessages(groupId: string, page: number = 1, limit: number = 50): Promise<{ data: GroupMessage[]; meta: any }> {
  // Intentar primero con /chat/conversations/ que es la ruta unificada
  const { data } = await api.get<{ data: GroupMessage[]; meta: any }>(`/chat/conversations/${groupId}/messages`, { params: { page, limit } });
  return data;
}

/**
 * Agrega miembros a un grupo (solo admin)
 */
export async function addMembersToGroup(groupId: string, userIds: string[]): Promise<ChatGroup> {
  const { data } = await api.post<ChatGroup>(`/chat/groups/${groupId}/members`, { userIds });
  return data;
}

/**
 * Elimina un miembro de un grupo (solo admin)
 */
export async function removeMemberFromGroup(groupId: string, userId: string): Promise<ChatGroup> {
  const { data } = await api.delete<ChatGroup>(`/chat/groups/${groupId}/members/${userId}`);
  return data;
}

/**
 * Promueve un miembro a admin (solo admin)
 */
export async function promoteMemberToAdmin(groupId: string, userId: string): Promise<ChatGroup> {
  const { data } = await api.patch<ChatGroup>(`/chat/groups/${groupId}/members/${userId}/promote`);
  return data;
}

/**
 * El usuario actual abandona el grupo
 */
export async function leaveGroup(groupId: string): Promise<void> {
  await api.post(`/chat/groups/${groupId}/leave`, {});
}

/**
 * Elimina un grupo (solo admin)
 */
export async function deleteGroup(groupId: string): Promise<void> {
  await api.delete(`/chat/groups/${groupId}`);
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
 * Determina si un mensaje fue enviado por el usuario current
 */
export function isOwnMessage(message: Message, currentUserId: string): boolean {
  return message.sender.id === currentUserId;
}
