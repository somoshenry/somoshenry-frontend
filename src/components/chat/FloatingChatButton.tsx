'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hook/useAuth';
import { useChat } from '@/context/ChatContext';
import useDarkMode from '@/hook/useDarkMode';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

interface Conversation {
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

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasNewMessages, unreadMessagesCount } = useChat();
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [theme] = useDarkMode();
  const mensajeSrc = theme === 'dark' ? '/mensajeD.png' : '/mensajeC.png';

  // Datos de ejemplo - reemplazar con datos reales del backend
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'María García',
      userAvatar: '/avatars/default.svg',
      lastMessage: 'Hola! ¿Cómo estás?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          senderId: 'user1',
          senderName: 'María García',
          content: 'Hola! ¿Cómo estás?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isOwn: false,
        },
        {
          id: 'm2',
          senderId: 'me',
          senderName: 'Yo',
          content: '¡Hola María! Todo bien, ¿y tú?',
          timestamp: new Date(Date.now() - 1000 * 60 * 4),
          isOwn: true,
        },
      ],
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Juan Pérez',
      userAvatar: '/avatars/default.svg',
      lastMessage: 'Perfecto, nos vemos mañana',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
      unreadCount: 0,
      messages: [
        {
          id: 'm3',
          senderId: 'me',
          senderName: 'Yo',
          content: '¿Quedamos para trabajar?',
          timestamp: new Date(Date.now() - 1000 * 60 * 65),
          isOwn: true,
        },
        {
          id: 'm4',
          senderId: 'user2',
          senderName: 'Juan Pérez',
          content: 'Perfecto, nos vemos mañana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isOwn: false,
        },
      ],
    },
  ]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversationId, conversations]);

  // No mostrar el botón si estamos en la página de chat o si no hay usuario autenticado
  if (pathname === '/chat' || !user) {
    return null;
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      senderName: 'Yo',
      content: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage.trim(),
            lastMessageTime: new Date(),
          };
        }
        return conv;
      })
    );

    setNewMessage('');
  };

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

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={menuRef}>
      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {!selectedConversation ? (
            // Lista de conversaciones
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mensajes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{conversations.length} conversaciones</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No tienes conversaciones</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button key={conv.id} onClick={() => setSelectedConversationId(conv.id)} className="w-full p-4 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="relative shrink-0">
                        {conv.userAvatar ? (
                          <img src={conv.userAvatar} alt={conv.userName || 'Usuario'} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
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
                {selectedConversation.userAvatar ? (
                  <img src={selectedConversation.userAvatar} alt={selectedConversation.userName || 'Chat'} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold" style={{ backgroundColor: '#ffff00' }}>
                    {(selectedConversation.userName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">{selectedConversation.userName || 'Conversación'}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">En línea</p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {selectedConversation.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!message.isOwn && (
                        <div className="shrink-0">
                          {selectedConversation.userAvatar ? (
                            <img src={selectedConversation.userAvatar} alt={message.senderName} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs font-bold" style={{ backgroundColor: '#ffff00' }}>
                              {message.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className={`rounded-2xl px-3 py-2 ${message.isOwn ? 'text-black' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`} style={message.isOwn ? { backgroundColor: '#ffff00' } : {}}>
                          <p className="text-sm whitespace-pre-wrap break-word">{message.content}</p>
                        </div>
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>{formatMessageTime(message.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm" />
                  <button type="submit" disabled={!newMessage.trim()} className="px-4 py-2 text-black font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:opacity-90" style={{ backgroundColor: '#ffff00' }}>
                    Enviar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Botón principal */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative group text-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110" style={{ backgroundColor: '#ffff00' }} aria-label="Abrir mensajes">
        {/* Animación ping para nuevos mensajes */}
        {hasNewMessages && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center">{unreadMessagesCount > 0 && <span className="text-white text-xs font-bold">{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</span>}</span>
          </span>
        )}

        {/* Icono de mensajes */}
        <img src={mensajeSrc} alt="mensajes" className="w-6 h-6" />

        {/* Tooltip */}
        {!isOpen && <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">Mensajes</span>}
      </button>
    </div>
  );
}
