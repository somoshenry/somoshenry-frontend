import { UserCacheData, ConversationUserMapping, LastReadTimestamps } from '@/interfaces/chat';

/**
 * Obtiene el cache de usuarios desde localStorage
 */
export function getUserCache(): Record<string, UserCacheData> {
  if (typeof window === 'undefined') return {};
  const cached = localStorage.getItem('chat_users_cache');
  return cached ? JSON.parse(cached) : {};
}

/**
 * Obtiene el cache de mapeo conversación->usuario desde localStorage
 */
export function getConversationCache(): ConversationUserMapping {
  if (typeof window === 'undefined') return {};
  const cached = localStorage.getItem('chat_conversations_cache');
  return cached ? JSON.parse(cached) : {};
}

/**
 * Obtiene un usuario específico del cache
 */
export function getUserFromCache(userId: string): UserCacheData | null {
  const cache = getUserCache();
  return cache[userId] || null;
}

/**
 * Guarda información de un usuario en el cache
 */
export function saveUserToCache(userId: string, userData: UserCacheData): void {
  if (typeof window === 'undefined') return;
  const cache = getUserCache();
  cache[userId] = userData;
  localStorage.setItem('chat_users_cache', JSON.stringify(cache));
}

/**
 * Guarda el mapeo conversación->usuario
 */
export function saveConversationUserMapping(conversationId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  const cache = getConversationCache();
  cache[conversationId] = userId;
  localStorage.setItem('chat_conversations_cache', JSON.stringify(cache));
}

/**
 * Obtiene el ID de usuario asociado a una conversación
 */
export function getUserIdFromConversation(conversationId: string): string | null {
  const cache = getConversationCache();
  return cache[conversationId] || null;
}

/**
 * Obtiene el timestamp de la última lectura de una conversación
 */
export function getLastReadTimestamp(conversationId: string): Date | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('chat_last_read');
  if (!cached) return null;
  const timestamps: LastReadTimestamps = JSON.parse(cached);
  const timestamp = timestamps[conversationId];
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Guarda el timestamp de la última lectura de una conversación
 */
export function saveLastReadTimestamp(conversationId: string): void {
  if (typeof window === 'undefined') return;
  const cached = localStorage.getItem('chat_last_read');
  const timestamps: LastReadTimestamps = cached ? JSON.parse(cached) : {};
  timestamps[conversationId] = new Date().toISOString();
  localStorage.setItem('chat_last_read', JSON.stringify(timestamps));
}
