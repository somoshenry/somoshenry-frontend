"use client";
import {AlertTriangle, Eye, Ban, CheckCircle, User, Calendar, MessageCircle} from "lucide-react";
import {useEffect, useState} from "react";
import {
  getPendingReports,
  moderatePost,
  updateReportStatus,
  ReportStatus,
  Report,
  deletePost,
  getPostById,
} from "@/services/adminService";
import {useAuth} from "@/hook/useAuth";
import {notifyPostDeleted, notifyReportersThankYou} from "@/services/notificationService";
import Swal from "sweetalert2";

interface ReportedPost {
  post: {
    id: string;
    title?: string;
    content: string;
    type: string;
    mediaURL?: string | null;
    createdAt: string;
    user?: {
      id: string;
      email: string;
      username?: string | null;
      name?: string | null;
      lastName?: string | null;
    };
  };
  reports: Array<{
    id: string;
    reason: string;
    description?: string | null;
    createdAt: string;
    reporter: {
      id: string;
      email: string;
      name?: string | null;
      lastName?: string | null;
    };
  }>;
  reportCount: number;
}

export default function ReportedPosts() {
  const {user: currentUser} = useAuth();
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReportedPosts();
  }, [currentPage]);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      // Obtener todos los reportes pendientes
      const allReports = await getPendingReports();

      // Filtrar solo reportes de posts (que tengan postId y post)
      const postReports = allReports.filter((r: Report) => r.postId && r.post);

      // Agrupar reportes por post
      const groupedByPost = postReports.reduce((acc: Record<string, ReportedPost>, report: Report) => {
        const postId = report.postId!;
        if (!acc[postId]) {
          acc[postId] = {
            post: report.post!,
            reports: [],
            reportCount: 0,
          };
        }
        acc[postId].reports.push(report);
        acc[postId].reportCount++;
        return acc;
      }, {} as Record<string, ReportedPost>);

      // Enriquecer posts con información completa del usuario y mediaURL
      const postsArray = await Promise.all(
        Object.values(groupedByPost).map(async (item: ReportedPost) => {
          // Obtener información completa del post (incluye user y mediaURL)
          const fullPost = await getPostById(item.post.id);
          if (fullPost) {
            item.post = fullPost;
          }
          return item;
        })
      );

      // Ordenar por cantidad de reportes
      postsArray.sort((a: ReportedPost, b: ReportedPost) => b.reportCount - a.reportCount);

      // Aplicar paginación manual
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = postsArray.slice(startIndex, endIndex);

      setReportedPosts(paginatedPosts);
      setTotal(postsArray.length);
    } catch (error) {
      console.error("Error al cargar posts reportados:", error);
      setReportedPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (postId: string, isInappropriate: boolean) => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      // PRIMERO: Actualizar el estado de todos los reportes del post
      // (Antes de eliminar, porque si eliminamos primero, los reportes se borran en cascada)
      if (selectedPost) {
        for (const report of selectedPost.reports) {
          await updateReportStatus(report.id, isInappropriate ? ReportStatus.RESOLVED : ReportStatus.DISMISSED);
        }
      }

      if (isInappropriate) {
        // Obtener la razón más común de los reportes
        const reasonCounts: Record<string, number> = {};
        selectedPost?.reports.forEach((report) => {
          reasonCounts[report.reason] = (reasonCounts[report.reason] || 0) + 1;
        });
        const mostCommonReason = Object.keys(reasonCounts).reduce(
          (a, b) => (reasonCounts[a] > reasonCounts[b] ? a : b),
          "OTHER"
        );

        // Obtener información del post antes de eliminarlo (para conseguir el userId)
        const fullPost = await getPostById(postId);

        // Notificar al autor del post
        if (fullPost?.user?.id) {
          notifyPostDeleted(fullPost.user.id, mostCommonReason, selectedPost?.post.content || fullPost.content, postId);
        }

        // Agradecer a los reportadores
        const reporterIds =
          selectedPost?.reports.map((r) => r.reporter.id).filter((id, index, self) => self.indexOf(id) === index) || [];
        if (reporterIds.length > 0) {
          notifyReportersThankYou(reporterIds, selectedPost?.post.content || "");
        }

        // Marcar el post como inapropiado (ocultar sin eliminar)
        await moderatePost(postId, true);
      } else {
        // Si NO es inapropiado: solo desmoderar (aprobar)
        await moderatePost(postId, false);
      }

      setShowModal(false);
      fetchReportedPosts();
      Swal.fire(`Post ${isInappropriate ? "ocultado" : "aprobado"} correctamente`);
    } catch (error) {
      console.error("Error al moderar post:", error);
      Swal.fire("Error al procesar la acción");
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayName = (user?: {
    name?: string | null;
    lastName?: string | null;
    username?: string | null;
    email?: string;
  }) => {
    if (!user) return "Usuario desconocido";
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) return user.email.split("@")[0];
    return "Usuario desconocido";
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      SPAM: "Spam",
      HARASSMENT: "Acoso",
      INAPPROPRIATE: "Contenido inapropiado",
      MISINFORMATION: "Desinformación",
      OTHER: "Otro",
    };
    return labels[reason] || reason;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts Reportados</h2>
          <span className="ml-auto bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">
            {total} reportados
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Revisa y modera los posts que han sido reportados por la comunidad
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando posts reportados...</div>
      ) : reportedPosts.length === 0 ? (
        <div className="p-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full">
                <CheckCircle className="text-green-500" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">¡Todo en orden!</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              No hay posts reportados pendientes de revisión en este momento.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reportedPosts.map((item) => {
              // Obtener la fecha del reporte más reciente
              const latestReport = item.reports.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              const reportDate = new Date(latestReport.createdAt);

              return (
                <div key={item.post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <User size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {getDisplayName(item.post.user)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • Post:{" "}
                          {new Date(item.post.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          • Reportado:{" "}
                          {reportDate.toLocaleDateString("es-ES", {day: "2-digit", month: "2-digit", year: "numeric"})}{" "}
                          {reportDate.toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"})}
                        </span>
                        <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-bold">
                          {item.reportCount} {item.reportCount === 1 ? "reporte" : "reportes"}
                        </span>
                      </div>

                      {item.post.title && (
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.post.title}</h3>
                      )}

                      <p className="text-gray-700 dark:text-gray-300 mb-3">{truncateContent(item.post.content)}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.reports.slice(0, 3).map((report) => (
                          <span
                            key={report.id}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-md text-xs font-medium"
                          >
                            {getReasonLabel(report.reason)}
                          </span>
                        ))}
                        {item.reports.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                            +{item.reports.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const fullPost = await getPostById(item.post.id);
                        if (fullPost) {
                          const updatedItem = {
                            ...item,
                            post: fullPost,
                          };
                          setSelectedPost(updatedItem);
                        } else {
                          setSelectedPost(item);
                        }
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Eye size={16} />
                      Revisar detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles y moderación */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detalles del Post Reportado</h3>
            </div>

            <div className="p-6">
              {/* Información del post */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <User size={20} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getDisplayName(selectedPost.post.user)}
                  </span>
                  {selectedPost.post.user?.email && (
                    <span className="text-sm text-gray-500">({selectedPost.post.user.email})</span>
                  )}
                </div>

                {selectedPost.post.title && (
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{selectedPost.post.title}</h4>
                )}

                <p className="text-gray-700 dark:text-gray-300 mb-3">{selectedPost.post.content}</p>

                {selectedPost.post.mediaURL && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {selectedPost.post.mediaURL.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={selectedPost.post.mediaURL}
                        controls
                        className="w-full h-auto max-h-96"
                        preload="metadata"
                      >
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    ) : (
                      <img
                        src={selectedPost.post.mediaURL}
                        alt="Post multimedia"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">{selectedPost.post.type}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(selectedPost.post.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Lista de reportes */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Reportes ({selectedPost.reportCount})
                </h4>

                <div className="space-y-3">
                  {selectedPost.reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getDisplayName(report.reporter)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {new Date(report.createdAt).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 rounded-md text-xs font-medium">
                          {getReasonLabel(report.reason)}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{report.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleModeratePost(selectedPost.post.id, true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:scale-105 text-white rounded-md font-medium cursor-pointer disabled:opacity-50"
                >
                  <Ban size={18} />
                  {actionLoading ? "Procesando..." : "Marcar como Inapropiado"}
                </button>

                <button
                  onClick={() => handleModeratePost(selectedPost.post.id, false)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:scale-105 text-white rounded-md font-medium cursor-pointer  disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {actionLoading ? "Procesando..." : "Rechazar Reporte"}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
