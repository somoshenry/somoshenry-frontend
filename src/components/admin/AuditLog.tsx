'use client';
import { useEffect, useState } from 'react';
import { Download, Filter, X, ChevronLeft, ChevronRight, User, Calendar, Activity } from 'lucide-react';
import { getAuditLogs, exportAuditLogs, AuditLog as AuditLogType, AuditFilters, AuditAction, translateAction, getActionColor } from '@/services/auditService';

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs({ ...filters, page: currentPage });
      setLogs(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportAuditLogs({
        adminId: filters.adminId,
        action: filters.action,
        targetType: filters.targetType,
        from: filters.from,
        to: filters.to,
      });

      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar logs:', error);
      alert('Error al exportar logs de auditoría');
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
    setCurrentPage(1);
    setTimeout(() => fetchLogs(), 100);
  };

  const getAdminName = (log: AuditLogType): string => {
    if (log.admin) {
      const { name, lastName, username, email } = log.admin;
      if (name && lastName) return `${name} ${lastName}`;
      if (username) return username;
      return email;
    }
    return 'Admin desconocido';
  };

  const formatDetails = (details?: string | null): string => {
    if (!details) return 'N/A';
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Auditoría</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Historial de acciones administrativas - Total: {total} registros</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50">
            <Download size={18} />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Acción</label>
              <select value={filters.action || ''} onChange={(e) => setFilters({ ...filters, action: (e.target.value as AuditAction) || undefined })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Todas las acciones</option>
                {Object.values(AuditAction).map((action) => (
                  <option key={action} value={action}>
                    {translateAction(action)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Objetivo</label>
              <input type="text" value={filters.targetType || ''} onChange={(e) => setFilters({ ...filters, targetType: e.target.value || undefined })} placeholder="ej: POST, USER, COMMENT" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Desde</label>
              <input type="date" value={filters.from || ''} onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Hasta</label>
              <input type="date" value={filters.to || ''} onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
              Aplicar Filtros
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2">
              <X size={16} />
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Logs */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando registros...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Activity size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No hay registros de auditoría</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Administrador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Objetivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          {new Date(log.createdAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{getAdminName(log)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>{translateAction(log.action)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{log.targetType}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.targetId.substring(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <details className="text-sm text-gray-600 dark:text-gray-400">
                          <summary className="cursor-pointer hover:text-blue-500">Ver detalles</summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto max-w-md">{formatDetails(log.details)}</pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
