'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useChat } from '@/context/ChatContext';

export default function SearchUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { joinConversation } = useChat();

  if (!isOpen) return null;

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) return setResults([]);

    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { name: value },
      });
      // si el back devuelve { users: [...] }
      const users = data.users || data.data || [];
      setResults(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('❌ Error buscando usuarios:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (userId: string) => {
    try {
      const { data } = await api.post('/chat/conversations', { peerUserId: userId });
      await joinConversation(data.id);
      setQuery('');
      setResults([]);
      onClose();
    } catch (error) {
      console.error('❌ Error creando o uniendo conversación:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nueva conversación</h2>

        <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar usuario..." className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4" />

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Buscando...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Sin resultados</p>
        ) : (
          <ul className="space-y-2">
            {results.map((u) => (
              <li key={u.id} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSelect(u.id)}>
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
