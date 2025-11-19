"use client";
import {useState} from "react";
import {getUsers} from "@/services/adminService";

interface SearchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: {id: string; name: string; avatar?: string; email: string}) => void;
  currentUserId: string;
}

interface SearchResult {
  id: string;
  name?: string | null;
  lastName?: string | null;
  email: string;
  profilePicture?: string | null;
}

export default function SearchUserModal({isOpen, onClose, onSelectUser, currentUserId}: SearchUserModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar usuarios en el backend
      const {users} = await getUsers({
        page: 1,
        limit: 20,
        name: query.trim(),
      });

      // Excluir el usuario actual
      const results = users.filter((user) => user.id !== currentUserId);
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: SearchResult) => {
    const displayName = user.name && user.lastName ? `${user.name} ${user.lastName}` : user.name || user.email;
    onSelectUser({
      id: user.id,
      name: displayName,
      avatar: user.profilePicture || undefined,
      email: user.email,
    });
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const getDisplayName = (user: SearchResult) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    return user.email.split("@")[0];
  };

  const getInitials = (user: SearchResult) => {
    if (user.name && user.lastName) {
      return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.name) return user.name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      {/* Backdrop con blur para ver el fondo */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Contenedor del modal con glassmorphism */}
      <div
        className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Nueva conversación</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Buscador con estilo del navbar/modal */}
          <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar usuarios por nombre o email..."
              className="flex-1 ml-3 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-400 absolute top-0"></div>
              </div>
              <p className="mt-6 text-gray-500 dark:text-gray-400 font-medium">Buscando...</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-16">
              <div className="bg-yellow-400/10 p-6 rounded-full inline-block mb-6">
                <svg
                  className="w-16 h-16 text-yellow-400 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Escribe al menos 2 caracteres</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Busca personas por nombre o email</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100/80 dark:bg-gray-800/80 p-6 rounded-full inline-block mb-6">
                <svg
                  className="w-16 h-16 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">No se encontraron usuarios</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Intenta con otro nombre o email</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm transition-all text-left hover:shadow-lg hover:scale-[1.01] border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-400/50"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={getDisplayName(user)}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg shadow">
                      {getInitials(user)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate text-base cursor-pointer">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer con info */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-b-3xl">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 Tip: Los chats grupales estarán disponibles próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
