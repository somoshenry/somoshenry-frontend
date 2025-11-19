"use client";
import {FileText, Trash2, Eye, User, Image, Video, Ban, CheckCircle} from "lucide-react";
import {useEffect, useState} from "react";
import {getPosts, getModeratedPosts, deletePost, moderatePost, AdminPost} from "@/services/adminService";
import {useAuth} from "@/hook/useAuth";
import Swal from "sweetalert2";

type TabType = "all" | "moderated";

export default function PostsManagement() {
  const {user: currentUser} = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchFunction = activeTab === "moderated" ? getModeratedPosts : getPosts;
      const {posts: fetchedPosts, total: totalPosts} = await fetchFunction({page: currentPage, limit});
      setPosts(fetchedPosts || []);
      setTotal(totalPosts || 0);
    } catch (error) {
      console.error("Error al cargar posts:", error);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    const result = await Swal.fire({
      title: "Confirmar Eliminación",
      text: "¿Seguro que quieres eliminar este post? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const deletedPost = posts.find((p) => p.id === postId);
      await deletePost(postId);

      fetchPosts();

      // Swal de éxito
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Post eliminado correctamente",
      });
    } catch (error: any) {
      // Swal de error mejorado
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al eliminar post",
      });
    }
  };

  const handleModeratePost = async (postId: string, isInappropriate: boolean) => {
    if (!currentUser) return;

    const action = isInappropriate ? "marcar como inapropiado" : "quitar moderación";

    const result = await Swal.fire({
      title: "Confirmación",
      text: `¿Seguro que quieres ${action} este post?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setActionLoading(true);
    try {
      const targetPost = posts.find((p) => p.id === postId);
      await moderatePost(postId, isInappropriate);

      fetchPosts();

      Swal.fire(`Post ${isInappropriate ? "moderado" : "aprobado"} correctamente`);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al moderar post",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayName = (user: AdminPost["user"]) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email.split("@")[0];
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getMediaIcon = (multimedia?: string | null) => {
    if (!multimedia) return null;
    const isVideo = multimedia.match(/\.(mp4|mov|avi|wmv|mkv|webm)$/i);
    return isVideo ? <Video size={16} className="text-purple-500" /> : <Image size={16} className="text-blue-500" />;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Posts</h2>
          <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
            {total} posts
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Vista de todos los posts publicados en la plataforma
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Todos los Posts
          </button>
          <button
            onClick={() => {
              setActiveTab("moderated");
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "moderated"
                ? "border-red-500 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Ban size={16} />
              Posts Moderados
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando posts...</div>
      ) : !posts || posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay posts disponibles</div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{getDisplayName(post.user)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {post.title && (
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{post.title}</h3>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{truncateContent(post.content)}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-md font-medium">{post.type}</span>
                      {post.mediaURL && (
                        <span className="flex items-center gap-1">
                          {getMediaIcon(post.mediaURL)}
                          Multimedia
                        </span>
                      )}
                      {post._count && (
                        <>
                          <span>💬 {post._count.comments}</span>
                          <span>❤️ {post._count.likes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                    onClick={() => window.open(`/home`, "_blank")}
                  >
                    <Eye size={16} />
                    Ver en feed
                  </button>

                  {activeTab === "all" ? (
                    <button
                      onClick={() => handleModeratePost(post.id, true)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 cursor-pointer hover:bg-orange-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <Ban size={16} />
                      Moderar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModeratePost(post.id, false)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 cursor-pointer hover:bg-green-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Quitar moderación
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} de {total} posts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 cursor-pointer dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 cursor-pointer dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
