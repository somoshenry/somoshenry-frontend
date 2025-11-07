'use client';
import { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { api } from '@/services/api';
import { useAuth } from '@/'; // Asegúrate de tener esto o algo equivalente

interface Conversation {
  id: string;
  userName?: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function ChatSidebar({ onSelectConversation, onOpenSearch }: { onSelectConversation: (id: string) => void; onOpenSearch: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { currentConversation, joinConversation } = useChat();
  const { currentUser } = useAuth(); // tu usuario logueado (debe tener id, name, etc.)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/chat/conversations');

        // Si tu backend devuelve { data: [...] }, ajustamos eso:
        const list = Array.isArray(data) ? data : data.data;

        const formatted = list.map((c: any) => {
          // encontrar el otro usuario (no el actual)
          const peer = c.participants?.find((p: any) => p.id !== currentUser?.id);

          return {
            id: c.id,
            userName: peer?.name || `${peer?.username || 'Usuario'}`,
            userAvatar: peer?.profilePicture || '/default-avatar.png',
            lastMessage: c.lastMessage?.content || '',
            lastMessageTime: c.lastMessage?.createdAt,
            unreadCount: c.unreadCount || 0,
          };
        });

        setConversations(formatted);
      } catch (error) {
        console.error('❌ Error cargando conversaciones:', error);
      }
    };

    fetchConversations();
  }, [currentConversation, currentUser]);

  const formatTime = (date?: string) => (date ? new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '');

  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
        <button onClick={onOpenSearch} className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black transition-colors">
          +
        </button>
      </div>

      {/* CONVERSATIONS LIST */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No tienes conversaciones aún</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                joinConversation(conv.id);
                onSelectConversation(conv.id);
              }}
              className={`w-full p-4 flex items-start gap-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${currentConversation?.id === conv.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
            >
              <img src={conv.userAvatar} alt={conv.userName} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.userName}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage || 'Sin mensajes aún'}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
