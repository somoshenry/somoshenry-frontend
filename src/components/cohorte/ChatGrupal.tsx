'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { getGroupMessages, sendGroupMessage, MessageType, GroupMessage, ChatGroup } from '@/services/chatService';
import { useAuth } from '@/hook/useAuth';
import { useSocket } from '@/hook/useSocket';
import { tokenStore } from '@/services/tokenStore';

interface ChatGrupalProps {
  groupId?: string;
  groupName?: string;
}

export default function ChatGrupal({ groupId, groupName = 'Chat Grupal' }: ChatGrupalProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  // WebSocket para mensajes en tiempo real
  const token = tokenStore.getAccess();
  const { isConnected, joinConversation, onMessageReceived } = useSocket({
    token,
    enabled: !!groupId,
  });

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cargar mensajes del grupo
  useEffect(() => {
    if (!groupId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await getGroupMessages(groupId);
        setMessages(response.data);
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [groupId]);

  // Unirse a la conversación por WebSocket
  useEffect(() => {
    if (!groupId || !isConnected) return;
    joinConversation(groupId);
  }, [groupId, isConnected, joinConversation]);

  // Escuchar mensajes nuevos por WebSocket
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onMessageReceived((message) => {
      setMessages((prev) => {
        // Evitar duplicados
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message as GroupMessage];
      });
    });

    return unsubscribe;
  }, [groupId, onMessageReceived]);

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;

    try {
      const message = await sendGroupMessage({
        groupId,
        content: newMessage.trim(),
        type: MessageType.TEXT,
      });

      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar mensaje. Por favor intenta de nuevo.');
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  // Función mock para limpiar chat (opcional, no afecta backend)
  const handleClearChat = () => {
    if (confirm('¿Estás seguro de limpiar el chat? Esto solo afectará tu vista local.')) {
      setMessages([]);
    }
  };

  // Si no hay groupId, mostrar UI mock
  if (!groupId) {
    return (
      <div className="flex flex-col rounded-2xl shadow-xl h-dvh md:h-screen from-gray-50 to-gray-100 dark:bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-5 py-3 bg-white/70 dark:bg-[#ffff00] backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-black/30 shadow-md">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2">💬 {groupName}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-center text-gray-500 dark:text-gray-400">No hay un grupo de chat configurado para esta cohorte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl shadow-xl h-dvh md:h-screen from-gray-50 to-gray-100 dark:bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* 🧭 Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-white/70 dark:bg-[#ffff00] backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-black/30 shadow-md">
        <h2 className="text-lg font-semibold text-black flex items-center gap-2">
          💬 {groupName}
          {isConnected && <span className="text-xs text-green-600">● En línea</span>}
        </h2>
        <button onClick={handleClearChat} className="text-gray-500 hover:text-red-500 transition-colors" title="Limpiar chat (solo vista local)">
          <Trash2 size={18} />
        </button>
      </div>

      {/* 🗨️ Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay mensajes todavía 💬</p>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isCurrentUser = user && msg.sender.id === user.id;
              const senderName = `${msg.sender.name || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.username || 'Usuario';

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUser && <img src={msg.sender.profilePicture || `https://api.dicebear.com/9.x/thumbs/svg?seed=${msg.sender.id}`} alt={senderName} width={32} height={32} className="rounded-full" />}
                  <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md ${isCurrentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                    {!isCurrentUser && <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{senderName}</span>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✍️ Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md flex gap-3">
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />
          </div>
        )}

        <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-2xl hover:scale-110 transition-transform">
          😊
        </button>
        <input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="w-2/3 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffff00]" />
        <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-4 bg-[#ffff00] hover:bg-[#ffff00]/70 cursor-pointer text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={20} color="#000000" />
        </button>
      </div>
    </div>
  );
}
