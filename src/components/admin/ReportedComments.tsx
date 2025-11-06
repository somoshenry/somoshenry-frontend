'use client';
import { MessageSquare, Eye, CheckCircle, User, Calendar, AlertCircle, Ban } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPendingReports, updateReportStatus, ReportStatus, Report, deleteComment } from '@/services/adminService';
import { useAuth } from '@/hook/useAuth';
import { createSystemNotification, SystemNotificationType } from '@/services/notificationService';

interface ReportedComment {
  comment: {
    id: string;
    content: string;
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

export default function ReportedComments() {
  const { user: currentUser } = useAuth();
  const [reportedComments, setReportedComments] = useState<ReportedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedComment, setSelectedComment] = useState<ReportedComment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReportedComments();
  }, [currentPage]);

  const fetchReportedComments = async () => {
    try {
      setLoading(true);
      // Obtener todos los reportes pendientes
      const allReports = await getPendingReports();

      console.log('📊 Total reportes:', allReports.length);
      console.log('📊 Reportes completos:', allReports);

      // Filtrar solo reportes de comentarios (que tengan commentId y comment)
      const commentReports = allReports.filter((r: Report) => r.commentId && r.comment);

      console.log('💬 Reportes de comentarios filtrados:', commentReports.length);
      console.log('💬 Primer reporte de comentario:', commentReports[0]);

      // Agrupar reportes por comentario
      const groupedByComment = commentReports.reduce((acc: Record<string, ReportedComment>, report: Report) => {
        const commentId = report.commentId!;
        if (!acc[commentId]) {
          acc[commentId] = {
            comment: report.comment!,
            reports: [],
            reportCount: 0,
          };
        }
        acc[commentId].reports.push(report);
        acc[commentId].reportCount++;
        return acc;
      }, {} as Record<string, ReportedComment>);

      // Convertir a array y ordenar por cantidad de reportes
      const commentsArray = Object.values(groupedByComment).sort((a: ReportedComment, b: ReportedComment) => b.reportCount - a.reportCount);

      console.log('📦 Comentarios agrupados:', commentsArray.length);
      console.log('📦 Primer comentario agrupado:', commentsArray[0]);

      // Aplicar paginación manual
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedComments = commentsArray.slice(startIndex, endIndex);

      setReportedComments(paginatedComments);
      setTotal(commentsArray.length);
    } catch (error) {
      console.error('Error al cargar comentarios reportados:', error);
      setReportedComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReports = async (action: 'resolve' | 'dismiss') => {
    if (!currentUser || !selectedComment) return;

    setActionLoading(true);
    try {
      const status = action === 'resolve' ? ReportStatus.RESOLVED : ReportStatus.DISMISSED;

      // Actualizar todos los reportes
      for (const report of selectedComment.reports) {
        await updateReportStatus(report.id, status);
      }

      setShowModal(false);
      fetchReportedComments();
      alert(`Reportes ${action === 'resolve' ? 'resueltos' : 'rechazados'} correctamente`);
    } catch (error) {
      console.error('Error al procesar reportes:', error);
      alert('Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!currentUser || !selectedComment) return;

    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario inapropiado? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(true);
    try {
      const commentId = selectedComment.comment.id;
      const authorId = selectedComment.comment.user?.id;

      // Eliminar el comentario (soft delete)
      await deleteComment(commentId);

      // Actualizar todos los reportes como RESOLVED
      for (const report of selectedComment.reports) {
        await updateReportStatus(report.id, ReportStatus.RESOLVED);
      }

      // Enviar notificación al autor del comentario
      if (authorId) {
        createSystemNotification(authorId, SystemNotificationType.COMMENT_DELETED, 'Comentario eliminado', 'Tu comentario fue eliminado por violar las normas de la comunidad.', {
          reason: 'Contenido inapropiado - reportado por la comunidad',
        });
      }

      // Agradecer a los reportantes
      for (const report of selectedComment.reports) {
        if (report.reporter?.id && report.reporter.id !== authorId) {
          createSystemNotification(report.reporter.id, SystemNotificationType.REPORT_THANK_YOU, 'Reporte procesado', 'Gracias por ayudarnos a mantener la comunidad segura. El comentario que reportaste ha sido eliminado.');
        }
      }

      setShowModal(false);
      fetchReportedComments();
      alert('Comentario eliminado correctamente y notificaciones enviadas');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar el comentario');
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayName = (user?: { name?: string | null; lastName?: string | null; username?: string | null; email?: string }) => {
    if (!user) return 'Usuario desconocido';
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario desconocido';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      SPAM: 'Spam',
      HARASSMENT: 'Acoso',
      INAPPROPRIATE: 'Contenido inapropiado',
      MISINFORMATION: 'Desinformación',
      OTHER: 'Otro',
    };
    return labels[reason] || reason;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-purple-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comentarios Reportados</h2>
          <span className="ml-auto bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">{total} reportados</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Revisa los comentarios reportados por la comunidad</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando comentarios reportados...</div>
      ) : reportedComments.length === 0 ? (
        <div className="p-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full">
                <CheckCircle className="text-green-500" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">¡Todo en orden!</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">No hay comentarios reportados pendientes de revisión.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reportedComments
              .filter((item) => item.comment)
              .map((item) => {
                // Obtener la fecha del reporte más reciente
                const latestReport = item.reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                const reportDate = new Date(latestReport.createdAt);

                return (
                  <div key={item.comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User size={16} className="text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">{item.comment.user ? getDisplayName(item.comment.user) : 'Usuario desconocido'}</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            • Reportado: {reportDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} {reportDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-bold">
                            {item.reportCount} {item.reportCount === 1 ? 'reporte' : 'reportes'}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-3">{truncateContent(item.comment.content)}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.reports.slice(0, 3).map((report) => (
                            <span key={report.id} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium">
                              {getReasonLabel(report.reason)}
                            </span>
                          ))}
                          {item.reports.length > 3 && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">+{item.reports.length - 3} más</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedComment(item);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
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
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50">
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {showModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detalles del Comentario Reportado</h3>
            </div>

            <div className="p-6">
              {/* Información del comentario */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <User size={20} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{getDisplayName(selectedComment.comment.user)}</span>
                  {selectedComment.comment.user?.email && <span className="text-sm text-gray-500">({selectedComment.comment.user.email})</span>}
                </div>

                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">{selectedComment.comment.content}</p>
              </div>

              {/* Lista de reportes */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Reportes ({selectedComment.reportCount})
                </h4>

                <div className="space-y-3">
                  {selectedComment.reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{getDisplayName(report.reporter)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{new Date(report.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium">{getReasonLabel(report.reason)}</span>
                      </div>
                      {report.description && <p className="text-sm text-gray-700 dark:text-gray-300">{report.description}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                {/* Botón principal para eliminar comentario inapropiado */}
                <button onClick={handleDeleteComment} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors disabled:opacity-50">
                  <Ban size={18} />
                  {actionLoading ? 'Procesando...' : 'Eliminar Comentario Inapropiado'}
                </button>

                {/* Botones secundarios */}
                <div className="flex gap-3">
                  <button onClick={() => handleResolveReports('resolve')} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:opacity-50">
                    <CheckCircle size={16} />
                    {actionLoading ? 'Procesando...' : 'Resolver sin eliminar'}
                  </button>

                  <button onClick={() => handleResolveReports('dismiss')} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors disabled:opacity-50">
                    <AlertCircle size={16} />
                    {actionLoading ? 'Procesando...' : 'Rechazar Reportes'}
                  </button>

                  <button onClick={() => setShowModal(false)} disabled={actionLoading} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
