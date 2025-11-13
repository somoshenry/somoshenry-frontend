import { Message, Conversation, Participant } from '@/interfaces/chat';
import { Message as BackendMessage, Conversation as BackendConversation, getDisplayName, getOtherParticipant } from '@/services/chatService';
import { getUserFromCache, saveUserToCache, saveConversationUserMapping, getUserIdFromConversation, getLastReadTimestamp } from './cacheHelpers';

/**
 * Convierte un mensaje del backend al formato del frontend
 */
export function convertMessage(msg: BackendMessage, currentUserId: string): Message {
  const isOwn = msg.sender.id === currentUserId;
  const senderId = msg.sender.id;
  const senderName = getDisplayName(msg.sender);
  const senderAvatar = msg.sender.profilePicture || undefined;

  // Cachear información del sender si no es propio
  if (!isOwn) {
    const cached = getUserFromCache(senderId);
    if (!cached) {
      saveUserToCache(senderId, {
        name: senderName,
        avatar: senderAvatar,
      });
    }
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
}

/**
 * Convierte una conversación del backend al formato del frontend
 */
export function convertConversation(conv: BackendConversation, currentUserId: string): Conversation {
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
  const lastMsg = messages.at(-1);

  // Obtener el timestamp de la última vez que leíste esta conversación
  const lastReadTime = getLastReadTimestamp(conv.id);

  // Contar mensajes no leídos: mensajes del otro usuario que llegaron después de la última lectura
  let unreadCount = 0;
  if (lastReadTime) {
    unreadCount = messages.filter((msg) => !msg.isOwn && msg.timestamp > lastReadTime).length;
  } else {
    // Si nunca has leído esta conversación, contar todos los mensajes del otro usuario
    unreadCount = messages.filter((msg) => !msg.isOwn).length;
  }

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
    userId = getUserIdFromConversation(conv.id) ?? undefined;
  }

  // Intentar obtener info del usuario
  let userName = otherUser ? getDisplayName(otherUser) : undefined;
  let userAvatar = otherUser?.profilePicture;

  // Si tenemos otherUser, guardarlo en cache
  if (otherUser && userId) {
    saveUserToCache(userId, {
      name: getDisplayName(otherUser),
      avatar: otherUser.profilePicture || undefined,
    });
    saveConversationUserMapping(conv.id, userId);
  }

  // Si no tenemos info completa y tenemos userId, buscar en cache
  if (userId && (!userName || userName === 'Conversación')) {
    const cached = getUserFromCache(userId);
    if (cached) {
      userName = cached.name;
      userAvatar = cached.avatar;
    }
  }

  // Si aún no tenemos nombre, usar fallback
  if (!userName) {
    userName = 'Conversación';
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
}

/**
 * Convierte un grupo del backend al formato de conversación del frontend
 */
export function convertGroupToConversation(group: any): Conversation {
  // Procesar participantes según estructura del backend
  let participantsArr: any[] = [];

  if (Array.isArray(group.participantsWithRoles) && group.participantsWithRoles.length > 0) {
    participantsArr = group.participantsWithRoles;
  } else if (Array.isArray(group.participants) && group.participants.length > 0) {
    participantsArr = group.participants;
  }

  const members = Array.isArray(group.members) ? group.members : participantsArr.filter((p: any) => p.role === 'MEMBER');
  const admins = Array.isArray(group.admins) ? group.admins : participantsArr.filter((p: any) => p.role === 'ADMIN');

  const allParticipants = [...admins, ...members];

  // Mapear participantes según estructura del backend
  const mappedParticipants: Participant[] = allParticipants.map((p) => {
    // Si tiene la propiedad 'user', extraer de ahí (estructura: {user: {...}, role: ...})
    if (p.user) {
      return {
        id: p.user.id,
        name: p.user.name ?? '',
        avatar: p.user.profilePicture ?? undefined,
        email: p.user.email,
        role: p.role,
      };
    }
    // Si no, asumir que viene directo (estructura: {id, name, email, ...})
    return {
      id: p.id,
      name: p.name ?? '',
      avatar: p.profilePicture ?? undefined,
      email: p.email,
      role: p.role,
    };
  });

  return {
    id: group.id,
    isGroup: true,
    groupName: group.name,
    userAvatar: group.imageUrl || undefined,
    participants: mappedParticipants,
    lastMessage: '',
    lastMessageTime: new Date(group.updatedAt),
    unreadCount: 0,
    messages: [],
  };
}
