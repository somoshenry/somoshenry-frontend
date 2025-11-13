// Interfaces para el chat del frontend

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
  role?: string; // Para grupos: 'ADMIN' | 'MEMBER'
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

// Tipos auxiliares para cache
export interface UserCacheData {
  name: string;
  avatar?: string;
}

export interface ConversationUserMapping {
  [conversationId: string]: string; // conversationId -> userId
}

export interface LastReadTimestamps {
  [conversationId: string]: string; // conversationId -> ISO timestamp
}
