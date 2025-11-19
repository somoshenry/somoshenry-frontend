"use client";
import {useState} from "react";
import {User, updateUserProfile} from "@/services/userService";
import {api} from "@/services/api";

interface ProfileEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileEditModal({user, isOpen, onClose, onUpdate}: ProfileEditModalProps) {
  // Archivos locales para subir
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [coverPictureFile, setCoverPictureFile] = useState<File | null>(null);

  // Preview URLs
  const [profilePicturePreview, setProfilePicturePreview] = useState(user.profilePicture || "");
  const [coverPicturePreview, setCoverPicturePreview] = useState(user.coverPicture || "");

  const [name, setName] = useState(user.name || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [biography, setBiography] = useState(user.biography || "");
  const [location, setLocation] = useState(user.location || "");
  const [website, setWebsite] = useState(user.website || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo de 200KB (exactamente 200000 bytes)
    const maxSize = 200000; // 200KB en bytes
    if (file.size > maxSize) {
      const sizeInKB = (file.size / 1024).toFixed(2);
      setError(`⚠️ La imagen de perfil pesa ${sizeInKB}KB. El máximo permitido es 195KB (200000 bytes)`);
      e.target.value = ""; // Limpiar el input
      return;
    }

    // Validar formato de imagen (solo JPG, JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("⚠️ Solo se permiten imágenes JPG, JPEG, PNG o WEBP");
      e.target.value = ""; // Limpiar el input
      return;
    }

    setProfilePictureFile(file);
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleCoverPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo de 200KB (exactamente 200000 bytes)
    const maxSize = 200000; // 200KB en bytes
    if (file.size > maxSize) {
      const sizeInKB = (file.size / 1024).toFixed(2);
      setError(`⚠️ La imagen de portada pesa ${sizeInKB}KB. El máximo permitido es 195KB (200000 bytes)`);
      e.target.value = ""; // Limpiar el input
      return;
    }

    // Validar formato de imagen (solo JPG, JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("⚠️ Solo se permiten imágenes JPG, JPEG, PNG o WEBP");
      e.target.value = ""; // Limpiar el input
      return;
    }

    setCoverPictureFile(file);
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let hasChanges = false;

      // 1. Construir objeto con solo los campos que tienen valor y son diferentes a los originales
      const updates: any = {};

      if (name && name !== user.name) {
        updates.name = name;
        hasChanges = true;
      }
      if (lastName && lastName !== user.lastName) {
        updates.lastName = lastName;
        hasChanges = true;
      }
      if (biography !== user.biography) {
        updates.biography = biography || null;
        hasChanges = true;
      }
      if (location !== user.location) {
        updates.location = location || null;
        hasChanges = true;
      }
      if (website && website !== user.website) {
        updates.website = website;
        hasChanges = true;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
      }

      // 2. Subir foto de perfil si hay un archivo nuevo
      if (profilePictureFile) {
        try {
          const formData = new FormData();
          formData.append("file", profilePictureFile);
          await api.put(`/files/uploadProfilePicture/${user.id}`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
          });
          hasChanges = true;
        } catch (uploadErr) {
          console.error("Error subiendo foto de perfil:", uploadErr);
          setError("Se actualizó el perfil pero hubo un error al subir la foto de perfil");
          setLoading(false);
          return;
        }
      }

      // 3. Subir foto de portada si hay un archivo nuevo
      if (coverPictureFile) {
        try {
          const formData = new FormData();
          formData.append("file", coverPictureFile);
          await api.put(`/files/uploadCoverPicture/${user.id}`, formData, {
            headers: {"Content-Type": "multipart/form-data"},
          });
          hasChanges = true;
        } catch (uploadErr) {
          console.error("Error subiendo foto de portada:", uploadErr);
          setError("Se actualizó el perfil pero hubo un error al subir la foto de portada");
          setLoading(false);
          return;
        }
      }

      if (!hasChanges) {
        setError("No se realizaron cambios");
        setLoading(false);
        return;
      }

      // 4. Recargar datos del usuario para tener las URLs actualizadas de Cloudinary
      const {data: freshUser} = await api.get(`/users/${user.id}`);
      onUpdate(freshUser);

      // Mostrar mensaje de éxito con SweetAlert
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        icon: "success",
        title: "✅ Perfil actualizado",
        text: "Los cambios se han guardado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (err: any) {
      console.error("Error al actualizar el perfil:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);

      // Mensaje de error más claro
      if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || "No autorizado";
        setError(`⚠️ Error 401: ${errorMsg}. Intenta cerrar sesión y volver a iniciar sesión.`);
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || "Datos inválidos";
        setError(`Error 400: ${errorMsg}`);
      } else if (err.response?.status === 403) {
        setError("⚠️ No tienes permisos para realizar esta acción.");
      } else if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || "Error del servidor"}`);
      } else {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Foto de Portada */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Foto de Portada</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleCoverPictureChange}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ffff00] file:text-black hover:file:bg-yellow-500 file:cursor-pointer"
            />
            {coverPicturePreview && (
              <div className="mt-2 rounded-lg overflow-hidden h-32">
                <img src={coverPicturePreview} alt="Preview portada" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">⚠️ Máximo: 195KB | Formatos: JPG, PNG, WEBP</p>
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Foto de Perfil</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleProfilePictureChange}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ffff00] file:text-black hover:file:bg-yellow-500 file:cursor-pointer"
            />
            {profilePicturePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={profilePicturePreview}
                  alt="Preview perfil"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">⚠️ Máximo: 195KB | Formatos: JPG, PNG, WEBP</p>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Biografía</label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{biography.length}/500 caracteres</p>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad, País"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* GitHub / Sitio Web */}
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-white">GitHub / Sitio Web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://github.com/tu-usuario"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffff00] dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa el link a tu perfil de GitHub o portafolio
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#ffff00] text-black rounded-lg hover:bg-yellow-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
