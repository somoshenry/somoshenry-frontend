'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCohorteChatGroupId } from '@/services/cohorteService';
import { io, Socket } from 'socket.io-client';
import { tokenStore } from '@/services/tokenStore';
import Swal from 'sweetalert2';

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

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: {
    id: string;
    name?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
  };
  createdAt: string;
  type?: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatGrupal({ cohorteId, currentUser }: ChatGrupalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatGroupId, setChatGroupId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Obtener ID del grupo
  useEffect(() => {
    const groupId = getCohorteChatGroupId(cohorteId);
    if (groupId) {
      setChatGroupId(groupId);
      console.log('✅ Grupo de chat encontrado:', groupId);
    } else {
      console.warn('⚠️ No hay grupo de chat asociado a esta cohorte');
      setLoading(false);
    }
  }, [cohorteId]);

  // Conectar Socket.IO
  useEffect(() => {
    if (!chatGroupId) return;

    const token = tokenStore.getAccess();
    if (!token) {
      console.error('❌ No hay token de autenticación');
      setLoading(false);
      return;
    }

    console.log('🔌 Conectando al socket...');

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket.id);
      setConnected(true);

      // Unirse al grupo
      socket.emit('joinGroup', { groupId: chatGroupId });
      console.log('📥 Uniéndose al grupo:', chatGroupId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
      setConnected(false);
    });

    socket.on('systemMessage', (data: any) => {
      console.log('📢 Mensaje del sistema:', data);
    });

    socket.on('messageReceived', (message: Message) => {
      console.log('📨 Mensaje recibido:', message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión:', error);
      setConnected(false);
    });

    setLoading(false);

    return () => {
      if (chatGroupId) {
        socket.emit('leaveGroup', { groupId: chatGroupId });
      }
      socket.disconnect();
    };
  }, [chatGroupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatGroupId || !socketRef.current || sending) {
      return;
    }

    try {
      setSending(true);

      console.log('📤 Enviando mensaje:', {
        groupId: chatGroupId,
        senderId: currentUser.id,
        content: newMessage,
      });

      socketRef.current.emit('sendGroupMessage', {
        groupId: chatGroupId,
        senderId: currentUser.id,
        content: newMessage.trim(),
        type: 'TEXT',
      });

      setNewMessage('');
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al enviar el mensaje',
      });
    } finally {
      setSending(false);
    }
  };

  const getDisplayName = (msg: Message) => {
    if (msg.sender) {
      if (msg.sender.name && msg.sender.lastName) {
        return `${msg.sender.name} ${msg.sender.lastName}`;
      }
      if (msg.sender.username) return msg.sender.username;
    }
    if (msg.senderId === currentUser.id) {
      return currentUser.name && currentUser.lastName ? `${currentUser.name} ${currentUser.lastName}` : currentUser.username || 'Tú';
    }
    return 'Usuario';
  };

  const getInitials = (msg: Message) => {
    const name = getDisplayName(msg);
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando chat...</span>
      </div>
    );
  }

  if (!chatGroupId) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay chat disponible</h3>
          <p className="text-gray-600 dark:text-gray-400">Esta cohorte aún no tiene un grupo de chat creado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-blue-500" size={24} />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chat Grupal</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {connected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Desconectado
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUser.id;
              const displayName = getDisplayName(msg);
              const initials = getInitials(msg);
              const avatar = msg.sender?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700" />
                    <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{isOwn ? 'Tú' : displayName}</span>
                      <div className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-none'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!connected || sending}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button onClick={handleSendMessage} disabled={!connected || sending || !newMessage.trim()} className="p-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors">
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
