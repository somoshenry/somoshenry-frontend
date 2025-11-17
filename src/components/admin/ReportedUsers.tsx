'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, X, UserX, Shield, Ban, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
  profilePicture?: string;
  role?: string;
}

interface Report {
  id: string;
  reason: string;
  description?: string;
  createdAt: string;
  reporter: User;
  reportedUser: User;
}

interface GroupedReport {
  user: User;
  reports: Report[];
  reportCount: number;
}

export default function ReportedUsers() {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<GroupedReport | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report?status=PENDING`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('No se pudieron obtener reportes:', response.status);
        setGroupedReports([]);
        return;
      }

      const allReports: Report[] = await response.json();

      // Filtrar solo reportes de usuarios (que tengan reportedUser)
      const userReports = allReports.filter((report) => report.reportedUser);

      // Agrupar reportes por usuario
      const grouped = userReports.reduce((acc, report) => {
        const userId = report.reportedUser.id;
        if (!acc[userId]) {
          acc[userId] = {
            user: report.reportedUser,
            reports: [],
            reportCount: 0,
          };
        }
        acc[userId].reports.push(report);
        acc[userId].reportCount++;
        return acc;
      }, {} as Record<string, GroupedReport>);

      // Convertir a array y ordenar por cantidad de reportes
      const sortedReports = Object.values(grouped).sort((a, b) => b.reportCount - a.reportCount);

      setGroupedReports(sortedReports);
    } catch (error) {
      console.error('Error al obtener reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas banear a este usuario? Esta acción bloqueará su cuenta.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');

      // Banear usuario
      const banResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!banResponse.ok) {
        throw new Error('Error al banear usuario');
      }

      // Marcar todos los reportes como resueltos
      if (selectedUser) {
        await Promise.all(
          selectedUser.reports.map((report) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/${report.id}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'RESOLVED' }),
            })
          )
        );
      }

      alert('Usuario baneado exitosamente');
      setSelectedUser(null);
      fetchReports();
    } catch (error) {
      console.error('Error al banear usuario:', error);
      alert('Error al banear usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReports = async () => {
    if (!selectedUser || !window.confirm('¿Estás seguro de que deseas rechazar estos reportes?')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');

      // Actualizar todos los reportes como REJECTED
      await Promise.all(
        selectedUser.reports.map((report) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/${report.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'REJECTED' }),
          })
        )
      );

      alert('Reportes rechazados correctamente');
      setSelectedUser(null);
      fetchReports();
    } catch (error) {
      console.error('Error al rechazar reportes:', error);
      alert('Error al rechazar reportes');
    } finally {
      setActionLoading(false);
    }
  };

  const translateReason = (reason: string): string => {
    const translations: Record<string, string> = {
      SPAM: 'Spam',
      HARASSMENT: 'Acoso',
      HATE_SPEECH: 'Discurso de odio',
      INAPPROPRIATE: 'Contenido inapropiado',
      FALSE_INFO: 'Información falsa',
      OTHER: 'Otro',
    };
    return translations[reason] || reason;
  };

  const getUserName = (user: User): string => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.username) return user.username;
    return user.email;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">Cargando reportes de usuarios...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
            <UserX className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios Reportados</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{groupedReports.length} usuarios con reportes pendientes</p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios reportados */}
      <div className="p-6">
        {groupedReports.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay usuarios reportados pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedReports.map((item) => (
              <div key={item.user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {item.user.profilePicture ? <img src={item.user.profilePicture} alt={getUserName(item.user)} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">{getUserName(item.user).charAt(0).toUpperCase()}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{getUserName(item.user)}</h4>
                        {item.user.role && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{item.user.role}</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {item.reportCount} {item.reportCount === 1 ? 'reporte' : 'reportes'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(item)} className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedUser.user.profilePicture ? <img src={selectedUser.user.profilePicture} alt={getUserName(selectedUser.user)} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">{getUserName(selectedUser.user).charAt(0).toUpperCase()}</div>}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getUserName(selectedUser.user)}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.user.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Lista de reportes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-500" />
                  Reportes ({selectedUser.reportCount})
                </h3>
                <div className="space-y-3">
                  {selectedUser.reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-medium rounded-full">{translateReason(report.reason)}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(report.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {report.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{report.description}</p>}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Reportado por: <span className="font-medium">{getUserName(report.reporter)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => handleBanUser(selectedUser.user.id)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium">
                  <Ban size={18} />
                  {actionLoading ? 'Procesando...' : 'Banear Usuario'}
                </button>
                <button onClick={handleRejectReports} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium">
                  <Shield size={18} />
                  {actionLoading ? 'Procesando...' : 'Rechazar Reportes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
