'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface MockMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
  };
}

export default function ChatGrupalMock() {
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState<MockMessage[]>([
    {
      id: '1',
      content: '¡Hola a todos! ¿Cómo van con el proyecto?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      sender: {
        id: '2',
        name: 'Carlos',
        lastName: 'Reyes',
        email: 'carlos.reyes@example.com',
        profilePicture: null,
      },
    },
    {
      id: '2',
      content: 'Todo bien por aquí. Estoy terminando la parte del backend.',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      sender: {
        id: '1',
        name: 'Ana',
        lastName: 'López',
        email: 'ana.lopez@example.com',
        profilePicture: null,
      },
    },
    {
      id: '3',
      content: 'Yo ya terminé el diseño del frontend. ¿Alguien necesita ayuda?',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      sender: {
        id: '3',
        name: 'Laura',
        lastName: 'Gómez',
        email: 'laura.gomez@example.com',
        profilePicture: null,
      },
    },
    {
      id: '4',
      content: 'Excelente trabajo equipo! Recuerden que la entrega es el viernes.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      sender: {
        id: '5',
        name: 'Sofía',
        lastName: 'Herrera',
        email: 'sofia.herrera@example.com',
        profilePicture: null,
      },
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mockCurrentUserId = '1';

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMockMessage: MockMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: {
        id: mockCurrentUserId,
        name: 'Ana',
        lastName: 'López',
        email: 'ana.lopez@example.com',
        profilePicture: null,
      },
    };

    setMessages((prev) => [...prev, newMockMessage]);
    setNewMessage('');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const getDisplayName = (sender: MockMessage['sender']) => {
    if (sender.name && sender.lastName) {
      return `${sender.name} ${sender.lastName}`;
    }
    return sender.email.split('@')[0];
  };

  const getUserInitials = (sender: MockMessage['sender']) => {
    if (sender.name && sender.lastName) {
      return `${sender.name[0]}${sender.lastName[0]}`.toUpperCase();
    }
    return sender.email.substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Grupal (Mock)</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{messages.length} mensajes</p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => {
            const isOwnMessage = message.sender.id === mockCurrentUserId;

            return (
              <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender.profilePicture ? <img src={message.sender.profilePicture} alt={getDisplayName(message.sender)} className="w-8 h-8 rounded-full object-cover" /> : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${isOwnMessage ? 'bg-blue-500' : 'bg-gray-500'}`}>{getUserInitials(message.sender)}</div>}
                  </div>

                  {/* Contenido del mensaje */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${isOwnMessage ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                      {!isOwnMessage && <p className="text-xs font-semibold mb-1 opacity-70">{getDisplayName(message.sender)}</p>}
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 items-end relative">
          {/* Emoji Picker */}
          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.AUTO} />
            </div>
          )}

          <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            😊
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-colors disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
