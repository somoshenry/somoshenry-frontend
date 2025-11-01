'use client';
import { useState } from 'react';
import { User, updateUserProfile } from '@/services/userService';

interface ProfileEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileEditModal({ user, isOpen, onClose, onUpdate }: ProfileEditModalProps) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePicture || '');
  const [coverPictureUrl, setCoverPictureUrl] = useState(user.coverPicture || '');
  const [name, setName] = useState(user.name || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [biography, setBiography] = useState(user.biography || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUserProfile({
        name: name || undefined,
        lastName: lastName || undefined,
        biography: biography || undefined,
        location: location || undefined,
        website: website || undefined,
        profilePicture: profilePictureUrl || undefined,
        coverPicture: coverPictureUrl || undefined,
      });

      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar el perfil:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);

      // Mensaje de error más claro
      if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || 'No autorizado';
        setError(`⚠️ Error 401: ${errorMsg}. Intenta cerrar sesión y volver a iniciar sesión.`);
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Datos inválidos';
        setError(`Error 400: ${errorMsg}`);
      } else if (err.response?.status === 403) {
        setError('⚠️ No tienes permisos para realizar esta acción.');
      } else if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error del servidor'}`);
      } else {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

          {/* Foto de Portada */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Foto de Portada (URL)</label>
            <input type="url" value={coverPictureUrl} onChange={(e) => setCoverPictureUrl(e.target.value)} placeholder="https://ejemplo.com/mi-foto-portada.jpg" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
            {coverPictureUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-32">
                <img
                  src={coverPictureUrl}
                  alt="Preview portada"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    setError('URL de imagen de portada inválida');
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa la URL de una imagen para tu portada</p>
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Foto de Perfil (URL)</label>
            <input type="url" value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)} placeholder="https://ejemplo.com/mi-foto-perfil.jpg" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
            {profilePictureUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={profilePictureUrl}
                  alt="Preview perfil"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    setError('URL de imagen de perfil inválida');
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa la URL de una imagen para tu perfil</p>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Apellido</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Biografía</label>
            <textarea value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="Cuéntanos sobre ti..." rows={3} maxLength={500} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white resize-none" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{biography.length}/500 caracteres</p>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Ubicación</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ciudad, País" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
          </div>

          {/* GitHub / Sitio Web */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">GitHub / Sitio Web</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://github.com/tu-usuario" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa el link a tu perfil de GitHub o portafolio</p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
