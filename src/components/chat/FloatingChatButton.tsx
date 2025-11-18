'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hook/useAuth';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/hook/useSocket';
import useDarkMode from '@/hook/useDarkMode';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { tokenStore } from '@/services/tokenStore';
import { getUserConversations, sendMessage, Message as BackendMessage, Conversation as BackendConversation, MessageType, getDisplayName, markConversationAsRead, deleteConversation /*, uploadChatMedia */ } from '@/services/chatService';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  tempId?: string;
  type?: MessageType;
  mediaUrl?: string;
}

interface Conversation {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function FloatingChatButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { hasNewMessages, unreadMessagesCount, markMessagesAsRead, markConversationAsRead: markConversationAsReadGlobal, refreshUnreadCount } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  // const [uploadingFile, setUploadingFile] = useState(false);
  // const [previewFile, setPreviewFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [theme] = useDarkMode();
  const mensajeSrc = theme === 'dark' ? '/mensajeD.png' : '/mensajeC.png';

  const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED !== 'false';
  const token = tokenStore.getAccess();
  const socket = useSocket({
    token: token || null,
    enabled: !!user && !!token && chatEnabled,
  });
  const buttonBaseClasses = 'py-2 text-black font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90';

  // Convertir mensaje del backend a formato frontend
  const convertMessage = useCallback((msg: BackendMessage, currentUserId: string): Message => {
    // Normalizar URL de avatar
    const getAvatarUrl = (url: string | null | undefined): string | undefined => {
      if (!url) return undefined;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`;
    };

    return {
      id: msg.id,
      senderId: msg.sender?.id || '',
      senderName: msg.sender ? getDisplayName(msg.sender) : 'Usuario',
      senderAvatar: getAvatarUrl(msg.sender?.profilePicture),
      content: msg.content || msg.mediaUrl || '',
      timestamp: new Date(msg.createdAt),
      isOwn: msg.sender?.id === currentUserId,
      type: msg.type,
      mediaUrl: msg.mediaUrl || undefined,
    };
  }, []);

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    if (!user?.id || !chatEnabled) return;

    try {
      setLoading(true);
      const backendConvs = await getUserConversations();

      // Normalizar URL de avatar
      const getAvatarUrl = (url: string | null | undefined): string | undefined => {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`;
      };

      const frontendConvs: Conversation[] = backendConvs.map((conv: BackendConversation) => {
        const messages = (conv.messages || []).map((msg) => convertMessage(msg, user.id));
        const lastMsg = messages[messages.length - 1];

        // Obtener el otro participante - CORREGIDO
        // Primero intentar desde participants
        let otherUser = conv.participants?.find((p) => p.id !== user.id);

        // Si no está en participants, buscar en los mensajes (sender que no sea el usuario actual)
        if (!otherUser && conv.messages && conv.messages.length > 0) {
          const otherMessage = conv.messages.find((msg) => msg.sender?.id !== user.id);
          if (otherMessage) {
            otherUser = otherMessage.sender;
          }
        }

        const avatarUrl = getAvatarUrl(otherUser?.profilePicture);

        return {
          id: conv.id,
          userId: otherUser?.id,
          userName: otherUser ? getDisplayName(otherUser) : 'Conversación',
          userAvatar: avatarUrl,
          lastMessage: lastMsg?.content || '',
          lastMessageTime: lastMsg?.timestamp || new Date(conv.updatedAt),
          // Contar solo mensajes no leídos del otro usuario (usando isRead del backend)
          unreadCount: (conv.messages || []).filter((msg) => msg.sender?.id !== user.id && !msg.isRead).length,
          messages,
        };
      });

      setConversations(frontendConvs.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()));
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [user, chatEnabled, convertMessage]);

  // Cargar conversaciones al abrir el menú
  useEffect(() => {
    if (isOpen && user && chatEnabled) {
      loadConversations();
    }
  }, [isOpen, user, chatEnabled, loadConversations]);

  // 🔔 Escuchar eventos de sincronización entre chat flotante y página /chat
  useEffect(() => {
    const handleChatSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { conversationId, action } = customEvent.detail || {};

      if (action === 'read' && conversationId) {
        // Marcar localmente la conversación como leída
        setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)));
      }
    };

    window.addEventListener('chat-sync', handleChatSync);
    return () => window.removeEventListener('chat-sync', handleChatSync);
  }, []);

  // Escuchar nuevos mensajes por WebSocket
  useEffect(() => {
    if (!socket.isConnected || !user?.id) return;

    const cleanup = socket.onMessageReceived((message: BackendMessage) => {
      const frontendMessage = convertMessage(message, user.id);
      const convId = message.conversation.id;

      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === convId);

        // Si la conversación no existe, cargar de nuevo
        if (convIndex === -1) {
          loadConversations();
          return prev;
        }

        // Actualizar conversación existente
        return prev.map((conv) => {
          if (conv.id === convId) {
            // Verificar si el mensaje ya existe
            const exists = conv.messages.some((m) => m.id === frontendMessage.id);
            if (exists) return conv;

            return {
              ...conv,
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
  }, [socket.isConnected, socket, user, convertMessage, loadConversations]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowEmoji(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId, conversations]);

  if (pathname === '/chat' || !user || !chatEnabled) return null;

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Mensaje optimista
    const tempMessage: Message = {
      id: tempId,
      tempId,
      senderId: user.id,
      senderName: getDisplayName(user),
      senderAvatar: user.profilePicture || undefined,
      content,
      timestamp: new Date(),
      isOwn: true,
    };

    // Agregar mensaje optimísticamente
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              messages: [...conv.messages, tempMessage],
              lastMessage: content,
              lastMessageTime: new Date(),
            }
          : conv
      )
    );

    setNewMessage('');

    // Enviar por WebSocket o HTTP
    try {
      if (socket.isConnected) {
        socket.sendMessage({
          conversationId: selectedConversationId,
          type: MessageType.TEXT,
          content,
        });
      } else {
        await sendMessage({
          conversationId: selectedConversationId,
          type: MessageType.TEXT,
          content,
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Revertir mensaje optimista en caso de error
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: conv.messages.filter((m) => m.id !== tempId),
              }
            : conv
        )
      );
    }
  };

  const handleOpenFullChat = () => {
    router.push('/chat');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);

    // Inmediatamente limpiar el contador de esa conversación
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)));

    // Marcar los mensajes como leídos usando el ChatContext (sincroniza automáticamente)
    markConversationAsReadGlobal(conversationId);

    // También marcar en el backend
    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Error al marcar conversación como leída:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e?: React.MouseEvent) => {
    // Prevenir que se abra la conversación al hacer clic en eliminar
    e?.stopPropagation();

    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }

    try {
      await deleteConversation(conversationId);

      // Remover la conversación del estado local
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

      // Si estaba seleccionada, deseleccionarla
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }

      // Refrescar el contador global
      refreshUnreadCount();
    } catch (error) {
      console.error('Error al eliminar conversación:', error);
      alert('Error al eliminar la conversación. Por favor intenta de nuevo.');
    }
  };

  /* ============================================
     FUNCIONALIDAD DE SUBIDA DE ARCHIVOS 
     Comentado hasta que el backend esté listo
     ============================================ */

  /*
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Solo se permiten imágenes y videos');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    // Crear preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewFile({ url: previewUrl, type: isImage ? 'image' : 'video' });
  };

  const handleSendFile = async () => {
    if (!previewFile || !selectedConversationId || !user) return;

    // Obtener el archivo del input
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      // Subir archivo
      const { url: mediaUrl } = await uploadChatMedia(file);

      // Determinar tipo de mensaje
      const messageType = previewFile.type === 'image' ? MessageType.IMAGE : MessageType.VIDEO;

      // Mensaje optimista
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        tempId,
        senderId: user.id,
        senderName: getDisplayName(user),
        senderAvatar: user.profilePicture || undefined,
        content: '',
        timestamp: new Date(),
        isOwn: true,
        type: messageType,
        mediaUrl,
      };

      // Agregar mensaje optimísticamente
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...conv.messages, tempMessage],
                lastMessage: messageType === MessageType.IMAGE ? '📷 Imagen' : '🎥 Video',
                lastMessageTime: new Date(),
              }
            : conv
        )
      );

      // Limpiar preview
      setPreviewFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Enviar mensaje
      if (socket.isConnected) {
        socket.sendMessage({
          conversationId: selectedConversationId,
          type: messageType,
          mediaUrl,
        });
      } else {
        await sendMessage({
          conversationId: selectedConversationId,
          type: messageType,
          mediaUrl,
        });
      }
    } catch (error) {
      console.error('Error al enviar archivo:', error);
      alert('Error al enviar el archivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCancelFile = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  */

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatMessageTime = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Ocultar el botón flotante en las páginas de videollamada
  // IMPORTANTE: Este return debe estar AL FINAL, después de todos los hooks
  if (pathname?.startsWith('/live/') && pathname !== '/live/create') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 mb-20 z-50" ref={menuRef}>
      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 h-[300px] md:h-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {!selectedConversation ? (
            // Lista de conversaciones
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mensajes</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{conversations.length} conversaciones</p>
                </div>
                <button onClick={handleOpenFullChat} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Abrir chat completo">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>Cargando...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No tienes conversaciones</p>
                    <button onClick={handleOpenFullChat} className="mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors">
                      Iniciar chat
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div key={conv.id} className="relative group">
                      <button onClick={() => handleSelectConversation(conv.id)} className="w-full p-4 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="relative shrink-0">
                          {conv.userAvatar ? <img src={conv.userAvatar} alt={conv.userName || 'Usuario'} className="w-12 h-12 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                          {!conv.userAvatar && (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: '#ffff00' }}>
                              {(conv.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">{conv.unreadCount}</span>}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate text-gray-900 dark:text-white">{conv.userName || 'Conversación'}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">{formatTime(conv.lastMessageTime)}</span>
                          </div>
                          <p className="text-sm truncate text-gray-500 dark:text-gray-400">{conv.lastMessage}</p>
                        </div>
                      </button>
                      {/* Botón de eliminar - aparece al hacer hover */}
                      <button onClick={(e) => handleDeleteConversation(conv.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar conversación">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            // Ventana de chat
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-3">
                <button onClick={() => setSelectedConversationId(null)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {selectedConversation.userAvatar ? <img src={selectedConversation.userAvatar} alt={selectedConversation.userName || 'Chat'} className="w-10 h-10 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                {!selectedConversation.userAvatar && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: '#ffff00' }}>
                    {(selectedConversation.userName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">{selectedConversation.userName || 'Conversación'}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">En línea</p>
                </div>
                {/* Botón de eliminar conversación */}
                <button onClick={(e) => handleDeleteConversation(selectedConversation.id, e)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors" title="Eliminar conversación">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {selectedConversation.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!message.isOwn && (
                        <div className="shrink-0">
                          {selectedConversation.userAvatar ? <img src={selectedConversation.userAvatar} alt={message.senderName} className="w-6 h-6 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                          {!selectedConversation.userAvatar && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs font-bold" style={{ backgroundColor: '#ffff00' }}>
                              {message.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className={`rounded-2xl px-3 py-2 ${message.isOwn ? 'text-black' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`} style={message.isOwn ? { backgroundColor: '#ffff00' } : {}}>
                          {/* Mostrar imagen */}
                          {message.type === MessageType.IMAGE && message.mediaUrl && <img src={message.mediaUrl} alt="Imagen enviada" className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity" style={{ maxHeight: '300px' }} onClick={() => window.open(message.mediaUrl, '_blank')} />}

                          {/* Mostrar video */}
                          {message.type === MessageType.VIDEO && message.mediaUrl && <video src={message.mediaUrl} controls className="max-w-full rounded-lg mb-1" style={{ maxHeight: '300px' }} />}

                          {/* Mostrar texto si existe */}
                          {message.content && <p className="text-sm whitespace-pre-wrap break-word">{message.content}</p>}
                        </div>
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>{formatMessageTime(message.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje con emojis */}
              <form onSubmit={handleSendMessage} className="relative p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {/* ============================================
                    UI DE SUBIDA DE ARCHIVOS - COMENTADA
                    Descomentar cuando el backend esté listo
                    ============================================ */}
                {/* Preview de archivo */}
                {/* {previewFile && (
                  <div className="mb-2 relative">
                    <div className="relative inline-block">
                      {previewFile.type === 'image' ? <img src={previewFile.url} alt="Preview" className="max-h-40 rounded-lg" /> : <video src={previewFile.url} className="max-h-40 rounded-lg" controls />}
                      <button type="button" onClick={handleCancelFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button type="button" onClick={handleSendFile} disabled={uploadingFile} className="ml-2 px-3 py-1 text-black font-medium rounded-lg transition-colors disabled:opacity-50 text-sm" style={{ backgroundColor: '#ffff00' }}>
                      {uploadingFile ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                )} */}

                {/* Picker flotante */}
                {showEmoji && (
                  <div className="absolute bottom-16 left-3 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} />
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  {/* ============================================
                      BOTONES DE ARCHIVOS - COMENTADOS
                      ============================================ */}
                  {/* Input file oculto */}
                  {/* <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" /> */}

                  {/* Botón adjuntar - solo si no hay preview */}
                  {/* {!previewFile && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Adjuntar imagen o video">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  )} */}

                  {/* Botón emoji */}
                  <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-xl hover:scale-110 transition-transform">
                    😊
                  </button>

                  {/* Input de texto */}
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm" />

                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`
        ${buttonBaseClasses}
        bg-[#ffff00] 
        hover:bg-yellow-300
        
        // Estilos para MÓVIL (Por defecto, solo el icono)
        px-3 md:hidden 
        
        // Estilos para ESCRITORIO (Aparece a partir de 'md')
        md:px-4 md:inline-flex md:text-sm
      `}
                  >
                    {/* 1. Botón para ESCRITORIO (Md en adelante) */}
                    <span className="hidden md:inline">Enviar</span>

                    {/* 2. Botón para MÓVIL (Menos de Md) */}
                    <span className="md:hidden">
                      <Send size={20} />
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Botón principal */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative group text-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110" style={{ backgroundColor: '#ffff00' }} aria-label="Abrir mensajes">
        {hasNewMessages && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center">{unreadMessagesCount > 0 && <span className="text-white text-xs font-bold">{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</span>}</span>
          </span>
        )}

        <img src={mensajeSrc} alt="mensajes" className="w-6 h-6" />

        {!isOpen && <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">Mensajes</span>}
      </button>
    </div>
  );
}
