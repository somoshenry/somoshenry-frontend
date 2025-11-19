import {useState, useEffect, useRef} from "react";
import {quickSearchUsers} from "@/services/searchService";
import {createGroup} from "@/services/chatService";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

export default function CreateGroupModal({isOpen, onClose, onGroupCreated}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Búsqueda reactiva tipo unbound
  useEffect(() => {
    let active = true;
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    quickSearchUsers(search, 10)
      .then(({users}) => {
        if (active) setResults(users);
      })
      .catch(() => {
        if (active) setError("Error al buscar usuarios");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const handleToggleUser = (user: any) => {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Guardar URL (en producción deberías subir a un servidor)
      // Por ahora usamos la preview como URL
      setGroupImage(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length < 2) {
      setError("El grupo debe tener nombre y al menos 2 miembros");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const group = await createGroup({
        name: groupName.trim(),
        userIds: selected.map((u) => u.id),
        // TODO: Subir la imagen a un servidor (Cloudinary) y enviar la URL
        // imageUrl: imagePreview || undefined,
      });
      onGroupCreated(group);
      onClose();
      // Reset
      setGroupName("");
      setGroupImage("");
      setImagePreview("");
      setSelected([]);
      setResults([]);
      setSearch("");
    } catch (e: any) {
      // Mostrar mensaje detallado del backend si existe
      const backendMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message;
      setError(backendMsg ? `Error al crear grupo: ${backendMsg}` : "Error al crear grupo");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#ffff00] to-yellow-500 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">Crear nuevo grupo</h2>
          <p className="text-white/80 text-sm mt-1">Agrega miembros para empezar</p>
        </div>

        <div className="p-6">
          {/* Imagen del grupo */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Grupo"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#ffff00]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#ffff00] to-yellow-500 flex items-center justify-center text-white">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-[#ffff00] rounded-full flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors"
                title="Cambiar imagen"
              >
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto del grupo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Haz clic en el ícono para elegir una imagen</p>
            </div>
          </div>

          {/* Nombre del grupo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del grupo</label>
            <input
              type="text"
              placeholder="Ej: Equipo de desarrollo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#ffff00] focus:ring-2 focus:ring-[#ffff00]/20 transition-all outline-none"
            />
          </div>

          {/* Miembros seleccionados */}
          {selected.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Miembros ({selected.length})
              </label>
              <div className="flex flex-wrap gap-3">
                {selected.map((user) => (
                  <div key={user.id} className="relative group">
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-full pl-1 pr-3 py-1">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#ffff00] flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                      <button
                        onClick={() => handleToggleUser(user)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Búsqueda */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar usuarios</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#ffff00] focus:ring-2 focus:ring-[#ffff00]/20 transition-all outline-none"
                autoFocus
              />
              <svg
                className="w-5 h-5 absolute left-3 top-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading && search.length >= 2 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Buscando...</div>
            )}
            {!loading && search.length >= 2 && results.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">No se encontraron usuarios</div>
            )}
            {results.map((user) => {
              const isSelected = selected.some((u) => u.id === user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => handleToggleUser(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-[#ffff00] dark:border-yellow-600"
                      : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#ffff00] to-yellow-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.name} {user.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botón crear */}
          <button
            onClick={handleCreate}
            disabled={loading || !groupName.trim() || selected.length < 2}
            className="w-full mt-6 py-3 bg-linear-to-r from-[#ffff00] to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading
              ? "Creando grupo..."
              : `Crear grupo con ${selected.length} miembro${selected.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
