'use client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import SearchUserModal from '@/components/chat/SearchUserModal';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hook/useAuth';
import { useChat } from '@/context/ChatContext';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Conversation {
  id: string;
  // Para chats individuales
  userId?: string;
  userName?: string;
  userAvatar?: string;
  // Para chats grupales
  isGroup?: boolean;
  groupName?: string;
  participants?: Participant[];
  // Común
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { user } = useAuth();
  const { markMessagesAsRead } = useChat();

  // Marcar mensajes como leídos cuando el usuario entra a la página de chat
  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'María García',
      userAvatar: '/avatars/default.svg',
      lastMessage: 'Hola! ¿Cómo estás?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
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
        {
          id: 'm3',
          senderId: 'user1',
          senderName: 'María García',
          content: 'Muy bien! Te quería consultar sobre el proyecto de Henry',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
          isOwn: false,
        },
      ],
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Juan Pérez',
      userAvatar: '/avatars/default.svg',
      lastMessage: 'Perfecto, nos vemos mañana',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderId: 'me',
          senderName: 'Yo',
          content: '¿Quedamos para trabajar en el proyecto?',
          timestamp: new Date(Date.now() - 1000 * 60 * 65),
          isOwn: true,
        },
        {
          id: 'm5',
          senderId: 'user2',
          senderName: 'Juan Pérez',
          content: 'Dale! Mañana a las 10 te parece?',
          timestamp: new Date(Date.now() - 1000 * 60 * 62),
          isOwn: false,
        },
        {
          id: 'm6',
          senderId: 'me',
          senderName: 'Yo',
          content: 'Perfecto! 👍',
          timestamp: new Date(Date.now() - 1000 * 60 * 61),
          isOwn: true,
        },
        {
          id: 'm7',
          senderId: 'user2',
          senderName: 'Juan Pérez',
          content: 'Perfecto, nos vemos mañana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          isOwn: false,
        },
      ],
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Ana López',
      userAvatar: '/avatars/default.svg',
      lastMessage: 'Gracias por tu ayuda!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
      messages: [
        {
          id: 'm8',
          senderId: 'user3',
          senderName: 'Ana López',
          content: 'Hola! Me ayudas con un ejercicio?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 10),
          isOwn: false,
        },
        {
          id: 'm9',
          senderId: 'me',
          senderName: 'Yo',
          content: 'Claro! Cuál es?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 5),
          isOwn: true,
        },
        {
          id: 'm10',
          senderId: 'user3',
          senderName: 'Ana López',
          content: 'Gracias por tu ayuda!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isOwn: false,
        },
      ],
    },
  ]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Crear nueva conversación con un usuario
  const handleCreateConversation = (selectedUser: { id: string; name: string; avatar?: string; email: string }) => {
    // Verificar si ya existe una conversación con este usuario
    const existingConv = conversations.find((c) => !c.isGroup && c.userId === selectedUser.id);

    if (existingConv) {
      // Si ya existe, solo la seleccionamos
      setSelectedConversationId(existingConv.id);
      return;
    }

    // Crear nueva conversación
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userAvatar: selectedUser.avatar,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: [],
      isGroup: false,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(newConversation.id);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId || !content.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      senderName: 'Yo',
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: content.trim(),
            lastMessageTime: new Date(),
          };
        }
        return conv;
      })
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto border-x border-gray-200 dark:border-gray-700">
        {/* Sidebar con lista de conversaciones */}
        <ChatSidebar conversations={conversations} selectedId={selectedConversationId} onSelectConversation={setSelectedConversationId} onOpenSearch={() => setIsSearchModalOpen(true)} />

        {/* Ventana de chat */}
        <ChatWindow conversation={selectedConversation} onSendMessage={handleSendMessage} />
      </div>

      {/* Modal de búsqueda de usuarios */}
      <SearchUserModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={(selectedUser) => {
          handleCreateConversation(selectedUser);
          setIsSearchModalOpen(false);
        }}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
