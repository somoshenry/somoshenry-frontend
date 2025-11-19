'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { getGroupMessages, sendGroupMessage, MessageType, GroupMessage, getDisplayName, getUserInitials } from '@/services/chatService';
import { io, Socket } from 'socket.io-client';
import { tokenStore } from '@/services/tokenStore';

interface ChatGrupalProps {
  readonly cohorteId: string;
  readonly currentUser: {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
    username?: string | null;
    profilePicture?: string | null;
  };
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatGrupal({ cohorteId, currentUser }: ChatGrupalProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 🔹 Cargar mensajes del grupo
  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        const response = await getGroupMessages(cohorteId, 1, 100);
        setMessages(response.data);
      } catch (error) {
        console.error('Error al cargar mensajes del chat:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [cohorteId]);

  // 🔹 Conectar al socket y escuchar mensajes nuevos
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) return;

    // Crear conexión del socket
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket conectado para chat grupal');
      // Unirse al room de la cohorte
      socket.emit('join-group', cohorteId);
    });

    // Escuchar mensajes nuevos
    const handleNewMessage = (message: GroupMessage) => {
      console.log('📩 Mensaje recibido:', message);
      // Solo agregar si es de esta cohorte y no es duplicado
      if (message.group.id === cohorteId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('group-message', handleNewMessage);

    return () => {
      socket.emit('leave-group', cohorteId);
      socket.off('group-message', handleNewMessage);
      socket.disconnect();
    };
  }, [cohorteId]);

  // 🔹 Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔹 Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await sendGroupMessage({
        groupId: cohorteId,
        content: messageContent,
        type: MessageType.TEXT,
      });

      // El mensaje se agregará automáticamente cuando llegue por socket
      // Pero si el socket falla, lo agregamos manualmente
      if (!socketRef.current?.connected) {
        setMessages((prev) => [...prev, sentMessage]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setNewMessage(messageContent); // Restaurar el mensaje si falla
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col rounded-2xl shadow-xl h-dvh md:h-screen from-gray-50 to-gray-100 dark:bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* 🧭 Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-white/70 dark:bg-[#ffff00] backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-black/30 shadow-md">
        <h2 className="text-lg font-semibold text-black flex items-center gap-2">💬 Chat de la Cohorte</h2>
        {loading && <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />}
      </div>

      {/* 🗨️ Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay mensajes todavía 💬</p>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isCurrentUserMessage = msg.sender.id === currentUser.id;
              const senderName = getDisplayName(msg.sender);
              const senderInitials = getUserInitials(msg.sender);
              const senderAvatar = msg.sender.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderInitials)}&background=random`;

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={`flex items-end gap-2 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUserMessage && <img src={senderAvatar} alt={senderName} width={32} height={32} className="rounded-full" />}
                  <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md ${isCurrentUserMessage ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                    {!isCurrentUserMessage && <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{senderName}</span>}
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
        <input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className=" w-2/3 px-4 py-2 rounded-full border  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffff00]" />
        <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} className="p-4 bg-[#ffff00] hover:bg-[#ffff00]/70 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-full transition-colors">
          {sending ? <Loader2 size={20} color="#000000" className="animate-spin" /> : <Send size={20} color="#000000" />}
        </button>
      </div>
    </div>
  );
}
