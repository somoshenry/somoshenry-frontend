"use client";
import {Conversation} from "@/interfaces/chat";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenSearch: () => void;
  onOpenCreateGroup: () => void;
}

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelectConversation,
  onOpenSearch,
  onOpenCreateGroup,
}: ChatSidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("es-ES", {day: "numeric", month: "short"});
  };

  return (
    <div className="w-full h-full border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{conversations.length} conversaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full bg-[#ffff00] cursor-pointer hover:scale-105 text-black transition-colors"
            title="Nueva conversación"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={onOpenCreateGroup}
            className="p-2 rounded-full bg-blue-400 cursor-pointer hover:bg-blue-500 text-white transition-colors"
            title="Nuevo grupo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No tienes conversaciones aún</p>
            <p className="text-sm mt-2">Envía un mensaje para empezar</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                selectedId === conv.id ? "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.userAvatar ? (
                  <img
                    src={conv.userAvatar}
                    alt={conv.userName || conv.groupName || "Usuario"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                    {(conv.userName || conv.groupName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold truncate ${
                      conv.unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {conv.userName || conv.groupName || "Conversación"}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    conv.unreadCount > 0
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
