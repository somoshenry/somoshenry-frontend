'use client';
import { useState } from 'react';
import { getUserById } from '@/services/userService';
import { api } from '@/services/api';

interface SearchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: { id: string; name: string; avatar?: string; email: string }) => void;
  currentUserId: string;
}

interface SearchResult {
  id: string;
  name?: string | null;
  lastName?: string | null;
  email: string;
  profilePicture?: string | null;
}

export default function SearchUserModal({ isOpen, onClose, onSelectUser, currentUserId }: SearchUserModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
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
      // Simular búsqueda de usuarios (en producción sería: await api.get('/users/search', { params: { q: query } }))
      // Por ahora creamos usuarios mock basados en la búsqueda
      const mockUsers: SearchResult[] = [
        {
          id: 'user-' + Math.random(),
          name: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@henry.com',
          profilePicture: null,
        },
        {
          id: 'user-' + Math.random(),
          name: 'Laura',
          lastName: 'Martínez',
          email: 'laura.martinez@henry.com',
          profilePicture: null,
        },
        {
          id: 'user-' + Math.random(),
          name: 'Pedro',
          lastName: 'Gómez',
          email: 'pedro.gomez@henry.com',
          profilePicture: null,
        },
        {
          id: 'user-' + Math.random(),
          name: 'Sofia',
          lastName: 'Torres',
          email: 'sofia.torres@henry.com',
          profilePicture: null,
        },
      ];

      // Filtrar por query (simulado)
      const filtered = mockUsers.filter((user) => user.name?.toLowerCase().includes(query.toLowerCase()) || user.lastName?.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase()));

      // Excluir el usuario actual
      const results = filtered.filter((user) => user.id !== currentUserId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
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
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const getDisplayName = (user: SearchResult) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    return user.email.split('@')[0];
  };

  const getInitials = (user: SearchResult) => {
    if (user.name && user.lastName) {
      return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.name) return user.name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Conversación</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar usuarios por nombre o email..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoFocus
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No se encontraron usuarios</p>
              <p className="text-xs mt-1">Intenta con otro nombre o email</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  {user.profilePicture ? <img src={user.profilePicture} alt={getDisplayName(user)} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg">{getInitials(user)}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{getDisplayName(user)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer con info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">💡 Tip: Los chats grupales estarán disponibles próximamente</p>
        </div>
      </div>
    </div>
  );
}
