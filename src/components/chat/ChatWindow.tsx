"use client";
import {Conversation} from "@/app/chat/page";
import {useState, useRef, useEffect} from "react";
import EmojiPicker, {EmojiClickData, Theme} from "emoji-picker-react";
import GroupInfoModal from "./GroupInfoModal";

interface ChatWindowProps {
  conversation: Conversation | undefined;
  onSendMessage: (content: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export default function ChatWindow({conversation, onSendMessage, onDeleteConversation}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [conversation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && conversation) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"});
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">Selecciona una conversación</p>
          <p className="text-sm mt-2">Elige un chat de la lista para empezar a conversar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900">
      {/* Header del chat */}
      <div className="absolute top-0 left-0 right-0 h-[73px] p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {conversation.userAvatar ? (
            <img
              src={conversation.userAvatar}
              alt={conversation.userName || conversation.groupName || "Chat"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
              {(conversation.userName || conversation.groupName || "C").charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={() => conversation.isGroup && setShowGroupInfo(true)}
            className={`flex-1 text-left ${
              conversation.isGroup
                ? "hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {conversation.userName || conversation.groupName || "Conversación"}
              </h2>
              {conversation.isGroup && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            {conversation.isGroup && conversation.participants && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{conversation.participants.length} miembros</p>
            )}
            {!conversation.isGroup && <p className="text-xs text-gray-500 dark:text-gray-400">En línea</p>}
          </button>
        </div>

        {/* Botón de eliminar conversación */}
        <button
          onClick={() => onDeleteConversation(conversation.id)}
          className="p-2 text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Eliminar conversación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Mensajes */}
      <div className="absolute top-[73px] bottom-[73px] left-0 right-0 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {conversation.messages.map((message, index) => {
          // Verificar si debemos mostrar el nombre del remitente
          // Solo en grupos y si es un mensaje diferente al anterior o es el primero
          const previousMessage = index > 0 ? conversation.messages[index - 1] : null;
          const showSenderName =
            conversation.isGroup &&
            !message.isOwn &&
            (!previousMessage || previousMessage.senderId !== message.senderId);

          return (
            <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[70%] ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar del remitente (solo en grupos, mensajes de otros, y cuando cambia el remitente) */}
                {conversation.isGroup && !message.isOwn && (
                  <div className="shrink-0 w-8 h-8 mt-auto mb-6">
                    {showSenderName ? (
                      message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                          {message.senderName.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  {/* Nombre del remitente (solo en grupos y mensajes de otros) */}
                  {showSenderName && (
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-2">
                      {message.senderName}
                    </p>
                  )}

                  {/* Burbuja del mensaje */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.isOwn
                        ? "bg-yellow-400 text-black rounded-br-sm"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-all leading-relaxed">{message.content}</p>
                  </div>

                  {/* Hora del mensaje */}
                  <p
                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 ${
                      message.isOwn ? "text-right" : "text-left"
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje con emojis */}
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0"
      >
        {/* Picker flotante */}
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Botón emoji */}
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-2xl hover:scale-110 cursor-pointer transition-transform"
          >
            😊
          </button>

          {/* Input de texto */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-full transition-colors cursor-pointer"
          >
            Enviar
          </button>
        </div>
      </form>

      {/* Modal de información del grupo */}
      {conversation.isGroup && conversation.participants && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          groupName={conversation.groupName || "Grupo"}
          groupImage={conversation.userAvatar}
          participants={conversation.participants}
        />
      )}
    </div>
  );
}
