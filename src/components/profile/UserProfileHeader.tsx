'use client';
import { useEffect, useState } from 'react';
import { getUserById, User } from '@/services/userService';
import { useAuth } from '@/hook/useAuth';

interface UserProfileHeaderProps {
  userId: string;
}

export default function UserProfileHeader({ userId }: UserProfileHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center bg-white dark:bg-gray-900 border-b pb-4">
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="w-11/12 -mt-10 flex flex-col items-center">
          <div className="bg-gray-200 dark:bg-gray-800 w-20 h-20 rounded-full animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mt-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mt-2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full flex flex-col items-center bg-white dark:bg-gray-900 border-b pb-4">
        <div className="w-full h-32 bg-red-100 dark:bg-red-900" />
        <div className="w-11/12 -mt-10 flex flex-col items-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Error al cargar el perfil'}</p>
        </div>
      </div>
    );
  }

  // Generar iniciales del usuario
  const getInitials = () => {
    const firstName = user.name?.trim()?.charAt(0) || '';
    const lastName = user.lastName?.trim()?.charAt(0) || '';
    const initials = (firstName + lastName).toUpperCase();

    if (initials) return initials;
    return user.email?.trim()?.charAt(0)?.toUpperCase() || '?';
  };

  // Formatear fecha de unión
  const formatJoinDate = () => {
    if (!user.joinDate) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
    const date = new Date(user.joinDate);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Verificar si es el perfil del usuario actual
  const isOwnProfile = currentUser && currentUser.id === userId;

  return (
    <div className="w-full flex flex-col items-center bg-white dark:bg-gray-900 border-b pb-4">
      {/* Cover Picture */}
      <div
        className="w-full h-32 relative"
        style={{
          backgroundColor: user.coverPicture ? 'transparent' : '#FFFF00',
          backgroundImage: user.coverPicture ? `url(${user.coverPicture})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="w-11/12 -mt-10 flex flex-col items-center">
        {/* Profile Picture */}
        <div className="relative">
          {user.profilePicture ? <img src={user.profilePicture} alt={`${user.name || user.email}'s profile`} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 object-cover" /> : <div className="bg-[#FFFF00] w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold border-4 border-white dark:border-gray-900">{getInitials()}</div>}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-semibold dark:text-white">{user.name && user.lastName ? `${user.name} ${user.lastName}` : user.name || user.email || 'Usuario'}</h1>
          {isOwnProfile && (
            <a href="/profile" className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400" title="Ir a mi perfil">
              ✏️
            </a>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">@{user.email?.split('@')[0] || 'usuario'}</p>

        {user.biography && <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mt-2">{user.biography}</p>}

        {/* Additional Info */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2 flex-wrap justify-center">
          {user.location && <span>📍 {user.location}</span>}
          <span>✅​ Miembro desde {formatJoinDate()}</span>
          {user.email && <span>📧 {user.email}</span>}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
              🔗 {user.website.includes('github.com') ? 'GitHub' : 'Sitio Web'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
