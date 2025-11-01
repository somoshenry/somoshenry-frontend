'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hook/useAuth';
import { updateUserProfile } from '@/services/userService';
import { useRouter } from 'next/navigation';

export default function ConfigForm() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [coverPictureUrl, setCoverPictureUrl] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfilePictureUrl(user.profilePicture || '');
      setCoverPictureUrl(user.coverPicture || '');
      setName(user.name || '');
      setLastName(user.lastName || '');
      setUsername(user.email?.split('@')[0] || ''); // Usamos email como base si no hay username
      setBiography(user.biography || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({
        name: name || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
        biography: biography || undefined,
        location: location || undefined,
        website: website || undefined,
        profilePicture: profilePictureUrl || undefined,
        coverPicture: coverPictureUrl || undefined,
      });

      setSuccess('✅ Perfil actualizado correctamente');

      // Recargar la página después de 1.5 segundos para reflejar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error al actualizar el perfil:', err);

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
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pl-64">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white mb-2">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400">Administra tu perfil y preferencias</p>
        </div>

        {/* Card de Edición de Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold dark:text-white">Editar Perfil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Actualiza tu información personal y pública</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mensajes de estado */}
            {error && <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">{error}</div>}

            {success && <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-800">{success}</div>}

            {/* Foto de Portada */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Foto de Portada (URL)</label>
              <input type="url" value={coverPictureUrl} onChange={(e) => setCoverPictureUrl(e.target.value)} placeholder="https://ejemplo.com/mi-foto-portada.jpg" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
              {coverPictureUrl && (
                <div className="mt-3 rounded-lg overflow-hidden h-40 border dark:border-gray-600">
                  <img
                    src={coverPictureUrl}
                    alt="Preview portada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
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
                <div className="mt-3 flex justify-center">
                  <img
                    src={profilePictureUrl}
                    alt="Preview perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresa la URL de una imagen para tu perfil</p>
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">Apellido</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            {/* Nombre de Usuario */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Nombre de Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="valen_henry" className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tu nombre de usuario único en la plataforma</p>
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Biografía</label>
              <textarea value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="Cuéntanos sobre ti..." rows={4} maxLength={500} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:text-white resize-none" />
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
              <button type="button" onClick={() => router.push('/profile')} disabled={isLoading} className="px-6 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50 transition">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
