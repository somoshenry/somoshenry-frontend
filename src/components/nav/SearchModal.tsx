"use client";

import {useState, useEffect, useCallback, useRef} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/services/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface UserResult {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  profilePicture: string | null;
  role: string;
}

interface PostResult {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    lastName: string | null;
    email: string;
    profilePicture: string | null;
  };
  mediaURL?: string | null;
  type: string;
}

type TabType = "users" | "posts";

export default function SearchModal({isOpen, onClose, initialQuery = ""}: SearchModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [query, setQuery] = useState(initialQuery);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setUserResults([]);
      setPostResults([]);
      setHasSearched(false);
      setActiveTab("users");
    }
  }, [isOpen]);

  // Búsqueda de usuarios (backend)
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUserResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const {data} = await api.get(`/users?name=${encodeURIComponent(searchQuery)}&limit=10`);
      const users = data?.users || data?.data || [];
      setUserResults(users);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setUserResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  // Búsqueda de posts (backend)
  const searchPosts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPostResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const {data} = await api.get("/posts", {
        params: {
          search: searchQuery.trim(),
          limit: 10,
          page: 1,
        },
      });

      // El backend devuelve data.posts o data.data
      const postsData = data?.posts || data?.data || [];
      const mapped = postsData.map((post: any) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: {
          id: post.user?.id || "",
          name: post.user?.name || "",
          lastName: post.user?.lastName || null,
          email: post.user?.email || "",
          profilePicture: post.user?.profilePicture || post.user?.avatar || null,
        },
        mediaURL: post.mediaURL || post.mediaUrl || null,
        type: post.type,
      }));

      setPostResults(mapped);
    } catch (error) {
      console.error("Error al buscar posts:", error);
      setPostResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  // Debounce para búsqueda automática
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        if (activeTab === "users") {
          searchUsers(query);
        } else {
          searchPosts(query);
        }
      }, 300);
    } else {
      setUserResults([]);
      setPostResults([]);
      setHasSearched(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab]);

  // Navegar a perfil de usuario
  const handleUserClick = (userId: string) => {
    router.push(`/user/${userId}`);
    onClose();
  };

  // Navegar a post (por ahora scroll o redirigir a home)
  const handlePostClick = (postId: string) => {
    router.push("/home");
    onClose();
    // TODO: implementar navegación directa al post o scroll
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDisplayName = (user: UserResult | PostResult["user"]) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    return user.email.split("@")[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", {day: "numeric", month: "short"});
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      {/* Backdrop con efecto blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Modal con glassmorphism */}
      <div
        className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con input de búsqueda */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 ">
          <div className="flex items-center gap-3 mb-4 ">
            <div className="flex-1 flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-200/50 dark:border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-[#ffff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar usuarios o publicaciones..."
                className="flex-1 ml-3 bg-transparent focus:outline-none  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("users")}
              className={` transition-all font-semibold hover:scale-105 cursor-pointer ${
                activeTab === "users"
                  ? "capitalize  font-semibold text-black rounded-xl  px-2 shadow-black/50  dark:text-black  text-md  bg-[#ffff00] transition duration-300 "
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Usuarios
              </span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`transition-all font-semibold hover:scale-105 cursor-pointer ${
                activeTab === "posts"
                  ? "capitalize  font-semibold text-black rounded-xl  px-2 shadow-black/50  dark:text-black  text-md  bg-[#ffff00] transition duration-300 "
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="flex items-center gap-2 hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                Publicaciones
              </span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#ffff00] absolute top-0"></div>
              </div>
              <p className="mt-6 text-gray-500 dark:text-gray-400 font-medium">Buscando...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[#ffff00]/10 p-6 rounded-full mb-6">
                <svg className="w-16 h-16 text-[#ffff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Escribe al menos 2 caracteres</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                {activeTab === "users" ? "Busca personas por nombre o email" : "Busca publicaciones por contenido"}
              </p>
            </div>
          ) : (
            <>
              {/* Resultados de usuarios */}
              {activeTab === "users" && (
                <div className="space-y-3">
                  {userResults.length === 0 && hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="bg-gray-100/80 dark:bg-gray-800/80 p-6 rounded-full mb-6">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                        No se encontraron usuarios
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Intenta con otro término de búsqueda
                      </p>
                    </div>
                  ) : (
                    userResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-[#ffff00]/30"
                      >
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={getDisplayName(user)}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#ffff00] flex items-center justify-center text-black font-bold text-xl shadow-lg">
                            {getDisplayName(user).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate text-lg">
                            {getDisplayName(user)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                            {user.role === "ADMIN"
                              ? "👑 Administrador"
                              : user.role === "TEACHER"
                              ? "📚 Docente"
                              : "🎓 Estudiante"}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 text-[#ffff00] opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Resultados de posts */}
              {activeTab === "posts" && (
                <div className="space-y-3">
                  {postResults.length === 0 && hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="bg-gray-100/80 dark:bg-gray-800/80 p-6 rounded-full mb-6">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                        No se encontraron publicaciones
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Intenta con otro término de búsqueda
                      </p>
                    </div>
                  ) : (
                    postResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="p-4 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] border border-gray-200/50 dark:border-gray-700/50 hover:border-[#ffff00]/50"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {post.user.profilePicture ? (
                            <img
                              src={post.user.profilePicture}
                              alt={getDisplayName(post.user)}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#ffff00] flex items-center justify-center text-black text-sm font-bold shadow">
                              {getDisplayName(post.user).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-gray-900 dark:text-white">
                                {getDisplayName(post.user)}
                              </p>
                              <span className="text-xs text-gray-400">·</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                            {post.mediaURL && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-[#ffff00] font-medium">
                                {post.type === "IMAGE" ? "📷" : post.type === "VIDEO" ? "🎥" : "📎"}
                                <span>Multimedia adjunta</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer con ayuda */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-b-3xl">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 border border-gray-300/50 dark:border-gray-600/50 rounded-lg shadow-sm font-semibold">
                ESC
              </kbd>
              <span className="font-medium">para cerrar</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 border border-gray-300/50 dark:border-gray-600/50 rounded-lg shadow-sm font-semibold">
                ↵
              </kbd>
              <span className="font-medium">para seleccionar</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
