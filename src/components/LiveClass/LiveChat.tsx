"use client";

import {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {Send} from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
}

interface LiveChatProps {
  roomId: string;
  token: string;
  userName: string;
  userAvatar?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({roomId, token, userName, userAvatar}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  // Initialize Socket
  useEffect(() => {
    if (!token) return;

    const socket = io(`${API_URL}/webrtc`, {
      auth: {token},
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("joinChatRoom", {roomId});
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Recibir mensajes anteriores
    socket.on("previousMessages", (msgs: ChatMessage[]) => {
      setMessages(msgs);
    });

    // Recibir nuevos mensajes
    socket.on("chatMessage", (data) => {
      const newMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        userId: data.userId,
        userName: data.userName || "Usuario",
        userAvatar: data.userAvatar,
        message: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, roomId, API_URL]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("sendChatMessage", {
      roomId,
      message: inputMessage,
      userName,
      userAvatar,
    });

    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-semibold">Chat</h3>
          <span className={`text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}>
            {isConnected ? "● En línea" : "● Desconectado"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-center text-sm">
            <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              {msg.userAvatar ? (
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  <picture>
                    <img src={msg.userAvatar} alt={msg.userName} className="w-full h-full object-cover" />
                  </picture>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {msg.userName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{msg.userName}</span>
                  <span className="text-xs text-gray-500">
                    {typeof msg.timestamp === "number"
                      ? new Date(msg.timestamp).toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"})
                      : new Date(msg.timestamp).toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"})}
                  </span>
                </div>
                <p className="text-sm text-gray-200 wrap-break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:border-yellow-400 focus:outline-none"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded-lg flex items-center justify-center transition"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
