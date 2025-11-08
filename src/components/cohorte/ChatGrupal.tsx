'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: string;
  sender: User;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  groupName: string;
  messages: Message[];
}

export default function ChatGrupal() {
  const [showEmoji, setShowEmoji] = useState(false);
  // 🔹 Datos "mockeados"
  const currentUser: User = {
    id: '1',
    name: 'Tú',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=You',
  };

  const mockUsers: User[] = [
    currentUser,
    {
      id: '2',
      name: 'Sofía',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Sofia',
    },
    {
      id: '3',
      name: 'Mateo',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mateo',
    },
  ];

  const [conversation, setConversation] = useState<Conversation>({
    id: 'chat-1',
    groupName: 'Cohorte 68',
    messages: [
      {
        id: 'm1',
        sender: mockUsers[1],
        content: '¡Hola equipo! ¿Listos para la reunión?',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        sender: mockUsers[2],
        content: 'Sí, solo termino de ajustar algo del código 😅',
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // 🔹 Enviar mensaje
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: crypto.randomUUID(),
      sender: currentUser,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    setNewMessage('');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };
  // 🔹 Borrar todos los mensajes (mock)
  const handleClearChat = () => {
    setConversation((prev) => ({ ...prev, messages: [] }));
  };

  return (
    <div className="flex flex-col rounded-2xl shadow-xl h-screen from-gray-50 to-gray-100 dark:bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* 🧭 Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-white/70 dark:bg-[#ffff00] backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-black/30 shadow-md">
        <h2 className="text-lg font-semibold text-black flex items-center gap-2">💬 {conversation.groupName}</h2>
        <button onClick={handleClearChat} className="text-gray-500 hover:text-red-500 transition-colors" title="Limpiar chat">
          <Trash2 size={18} />
        </button>
      </div>

      {/* 🗨️ Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay mensajes todavía 💬</p>
        ) : (
          <AnimatePresence>
            {conversation.messages.map((msg) => {
              const isCurrentUser = msg.sender.id === currentUser.id;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUser && <img src={msg.sender.avatar} alt={msg.sender.name} width={32} height={32} className="rounded-full" />}
                  <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md ${isCurrentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                    {!isCurrentUser && <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{msg.sender.name}</span>}
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
        <button onClick={handleSendMessage} className="p-4 bg-[#ffff00] hover:bg-[#ffff00]/70 cursor-pointer text-white rounded-full transition-colors">
          <Send size={20} color="#000000" />
        </button>
      </div>
    </div>
  );
}
