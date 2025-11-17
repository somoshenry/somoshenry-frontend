'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, UserPlus, UserMinus, Flag } from 'lucide-react';
import { getUserProfile, User } from '@/services/userService';
import { getFollowStats, followUser, unfollowUser, checkFollowStatus } from '@/services/followService';
import { reportUser } from '@/services/reportService';
import { openConversation } from '@/services/chatService';
import { useAuth } from '@/hook/useAuth';
import ProfileEditModal from './ProfileEditModal';
import FollowListModal from './FollowListModal';

export default function ProfileHeader() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');

  // Determinar si es el perfil propio
  const isOwnProfile = currentUser?.id === user?.id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);

        // Cargar estadísticas de seguimiento
        if (userData?.id) {
          const stats = await getFollowStats(userData.id);
          setFollowStats(stats);

          // Verificar si el usuario actual sigue a este perfil
          if (currentUser?.id && currentUser.id !== userData.id) {
            const followStatus = await checkFollowStatus(currentUser.id, userData.id);
            setIsFollowing(followStatus);
          }
        }
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser?.id]);

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Función para seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (!user?.id || followLoading) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        const result = await unfollowUser(user.id);
        if (result.success) {
          setIsFollowing(false);
          setFollowStats((prev) => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
        }
      } else {
        const result = await followUser(user.id);
        if (result.success) {
          setIsFollowing(true);
          setFollowStats((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }));
        }
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Función para abrir chat
  const handleOpenChat = async () => {
    if (!user?.id) return;

    try {
      const conversation = await openConversation(user.id);
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (error) {
      console.error('Error al abrir chat:', error);
      alert('Error al abrir el chat. Por favor intenta de nuevo.');
    }
  };

  // Función para reportar usuario
  const handleReportUser = async (reason: string, description: string) => {
    if (!user?.id) return;

    try {
      await reportUser(user.id, reason as any, description);
      setShowReportModal(false);
      alert('Reporte enviado exitosamente. Será revisado por un administrador.');
    } catch (error) {
      console.error('Error al reportar usuario:', error);
      alert('Error al enviar el reporte. Por favor intenta de nuevo.');
    }
  };

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

    // Si hay iniciales, usarlas; si no, usar email; si no hay email, usar '?'
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

  return (
    <div className="w-full flex flex-col items-center bg-white dark:bg-gray-900 border-b pb-4">
      {/* Cover Picture */}
      <div
        className="w-full h-32 relative group"
        style={{
          backgroundColor: user.coverPicture ? 'transparent' : '#FFFF00',
          backgroundImage: user.coverPicture ? `url(${user.coverPicture})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Botón de editar portada */}
        <button onClick={() => setIsEditModalOpen(true)} className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          ✏️ Editar portada
        </button>
      </div>

      <div className="w-11/12 -mt-10 flex flex-col text-black items-center">
        {/* Profile Picture */}
        <div className="relative group">
          {user.profilePicture ? <img src={user.profilePicture} alt={`${user.name || user.email}'s profile`} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 object-cover" /> : <div className="bg-[#FFFF00] w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold border-4 border-white dark:border-gray-900">{getInitials()}</div>}
          {/* Botón de editar foto de perfil */}
          <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 text-black p-1.5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Editar foto de perfil">
            ✏️
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-semibold dark:text-white">{user.name && user.lastName ? `${user.name} ${user.lastName}` : user.name || user.email || 'Usuario'}</h1>
          <button onClick={() => setIsEditModalOpen(true)} className="text-black hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400" title="Editar perfil">
            ✏️
          </button>
        </div>
        <p className="text-black dark:text-gray-400">@{user.email?.split('@')[0] || 'usuario'}</p>

        {user.biography && <p className="text-sm text-black dark:text-gray-400 text-center max-w-md mt-2">{user.biography}</p>}

        {/* Follow Stats */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
          <button
            onClick={() => {
              setFollowModalTab('followers');
              setShowFollowModal(true);
            }}
            className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {followStats.followersCount} <span className="font-normal">Seguidores</span>
          </button>
          <button
            onClick={() => {
              setFollowModalTab('following');
              setShowFollowModal(true);
            }}
            className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {followStats.followingCount} <span className="font-normal">Siguiendo</span>
          </button>
        </div>

        {/* Botones de acción (solo si NO es el perfil propio) */}
        {!isOwnProfile && currentUser && (
          <div className="flex gap-2 mt-3">
            {/* Botón de Seguir/Dejar de Seguir */}
            <button onClick={handleFollowToggle} disabled={followLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-yellow-400 hover:bg-yellow-500 text-black'} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {followLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : isFollowing ? (
                <>
                  <UserMinus size={18} />
                  Dejar de seguir
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Seguir
                </>
              )}
            </button>

            {/* Botón de Chat */}
            <button onClick={handleOpenChat} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all" title="Enviar mensaje">
              <MessageCircle size={18} />
              Mensaje
            </button>

            {/* Botón de Reportar */}
            <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all" title="Reportar usuario">
              <Flag size={18} />
              Reportar
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="flex gap-4 text-sm text-black dark:text-gray-400 mt-2 flex-wrap justify-center">
          {user.location && <span>📍 {user.location}</span>}
          <span>✅​ Miembro desde {formatJoinDate()}</span>
          {user.email && <span>📧 {user.email}</span>}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
              🔗 {user.website.includes('github.com') ? 'GitHub' : 'Sitio Web'}
            </a>
          )}
        </div>

        {/* Stats ACA HAY QUE PONER MAS ADELTANTE EL TEMA NIVEL DE SUB!!!! */}
        {/* <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            Rol: <span className="font-semibold">{user.role}</span>
          </span>
          <span className={`px-3 py-1 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800'}`}>{user.status === 'ACTIVE' ? '✓ Activo' : user.status}</span>
        </div> */}
      </div>

      {/* Modal de edición */}
      <ProfileEditModal user={user} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdateProfile} />

      {/* Modal de reporte */}
      {showReportModal && <ReportUserModal userName={user.name && user.lastName ? `${user.name} ${user.lastName}` : user.name || user.email || 'Usuario'} onClose={() => setShowReportModal(false)} onSubmit={handleReportUser} />}

      {/* Modal de seguidores */}
      {showFollowModal && user && <FollowListModal userId={user.id} initialTab={followModalTab} onClose={() => setShowFollowModal(false)} />}
    </div>
  );
}

// Modal simple para reportar usuario
function ReportUserModal({ userName, onClose, onSubmit }: { userName: string; onClose: () => void; onSubmit: (reason: string, description: string) => void }) {
  const [reason, setReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Por favor describe el motivo del reporte');
      return;
    }

    setSubmitting(true);
    await onSubmit(reason, description);
    setSubmitting(false);
  };

  const reasons = [
    { value: 'SPAM', label: 'Spam o contenido no deseado' },
    { value: 'HARASSMENT', label: 'Acoso o intimidación' },
    { value: 'INAPPROPRIATE', label: 'Contenido inapropiado' },
    { value: 'MISINFORMATION', label: 'Información falsa' },
    { value: 'OTHER', label: 'Otro motivo' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reportar a {userName}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivo del reporte</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500">
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción (requerido)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe detalladamente el motivo de tu reporte..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={submitting || !description.trim()} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
