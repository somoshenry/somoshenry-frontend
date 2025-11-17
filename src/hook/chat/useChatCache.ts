import { useCallback } from 'react';
import { getUserCache, getConversationCache, getUserFromCache as getUserFromCacheUtil, saveUserToCache as saveUserToCacheUtil, saveConversationUserMapping as saveConversationUserMappingUtil, getUserIdFromConversation as getUserIdFromConversationUtil, getLastReadTimestamp as getLastReadTimestampUtil, saveLastReadTimestamp as saveLastReadTimestampUtil } from '@/utils/chat/cacheHelpers';
import { UserCacheData } from '@/interfaces/chat';

/**
 * Hook para manejar el cache de información de chat en localStorage
 */
export function useChatCache() {
  const getUserFromCache = useCallback((userId: string) => {
    return getUserFromCacheUtil(userId);
  }, []);

  const saveUserToCache = useCallback((userId: string, userData: UserCacheData) => {
    saveUserToCacheUtil(userId, userData);
  }, []);

  const saveConversationUserMapping = useCallback((conversationId: string, userId: string) => {
    saveConversationUserMappingUtil(conversationId, userId);
  }, []);

  const getUserIdFromConversation = useCallback((conversationId: string) => {
    return getUserIdFromConversationUtil(conversationId);
  }, []);

  const getLastReadTimestamp = useCallback((conversationId: string) => {
    return getLastReadTimestampUtil(conversationId);
  }, []);

  const saveLastReadTimestamp = useCallback((conversationId: string) => {
    saveLastReadTimestampUtil(conversationId);
  }, []);

  return {
    getUserCache,
    getConversationCache,
    getUserFromCache,
    saveUserToCache,
    saveConversationUserMapping,
    getUserIdFromConversation,
    getLastReadTimestamp,
    saveLastReadTimestamp,
  };
}
