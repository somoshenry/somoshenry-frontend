'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectSocket } from '../services/socket';
import { api } from '../services/api';

interface Message {
  id: string;
  conversationId: string;
  content?: string;
  mediaUrl?: string;
  senderId: string;
  createdAt: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  isRead?: boolean;
}

interface Conversation {
  id: string;
  participants: any[];
  messages: Message[];
}

interface ChatContextType {
  socketConnected: boolean;
  currentConversation: Conversation | null;
  messages: Message[];
  joinConversation: (conversationId: string) => Promise<void>;
  openConversationWith: (peerUserId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string, mediaUrl?: string) => void;
  markMessagesAsRead: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);
export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<ReturnType<typeof connectSocket> | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);
    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));
    s.on('messageReceived', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => s.disconnect();
  }, []);

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!socket) return;
      try {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        const msgs = res.data.data || [];
        setCurrentConversation((prev) => (prev ? { ...prev, id: conversationId, messages: msgs } : { id: conversationId, participants: [], messages: msgs }));
        setMessages(msgs);
        socket.emit('joinConversation', { conversationId });
      } catch (err) {
        console.error('❌ Error uniendo conversación:', err);
      }
    },
    [socket]
  );

  const openConversationWith = useCallback(
    async (peerUserId: string) => {
      try {
        const { data } = await api.post('/chat/conversations', { peerUserId });
        await joinConversation(data.id);
      } catch (err) {
        console.error('❌ Error creando conversación:', err);
      }
    },
    [joinConversation]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string, type = 'TEXT', mediaUrl?: string) => {
      if (!socket) return;
      socket.emit('sendMessage', { conversationId, type, content, mediaUrl });
    },
    [socket]
  );

  const markMessagesAsRead = useCallback(async () => {
    if (!currentConversation) return;
    try {
      await Promise.all(messages.map((m) => !m.isRead && api.patch(`/chat/messages/${m.id}/read`).catch(() => null)));
    } catch (err) {
      console.error('❌ Error marcando mensajes como leídos:', err);
    }
  }, [messages, currentConversation]);

  return <ChatContext.Provider value={{ socketConnected, currentConversation, messages, joinConversation, openConversationWith, sendMessage, markMessagesAsRead }}>{children}</ChatContext.Provider>;
};
