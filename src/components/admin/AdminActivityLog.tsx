'use client';
import { History, UserCog, Trash2, Edit, RotateCcw, Shield, Filter, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hook/useAuth';

export interface AdminActivity {
  id: string;
  adminEmail: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'post' | 'comment';
  targetId: string;
  targetName: string;
  details: string;
  timestamp: Date;
  icon: string;
  color: string;
}

const ACTIVITY_STORAGE_KEY = 'admin_activity_log';

export default function AdminActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [filter, setFilter] = useState<'all' | 'user' | 'post' | 'comment'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir strings de fecha a objetos Date
        const withDates = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }));
        setActivities(withDates);
      }
    } catch (error) {
      console.error('Error loading admin activities:', error);
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;

    // Filtro por tipo
    if (filter !== 'all') {
      filtered = filtered.filter((a) => a.targetType === filter);
    }

    // Filtro por tiempo
    const now = new Date();
    if (timeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter((a) => a.timestamp >= today);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => a.timestamp >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => a.timestamp >= monthAgo);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES');
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      UserCog,
      Trash2,
      Edit,
      RotateCcw,
      Shield,
    };
    const IconComponent = icons[iconName] || UserCog;
    return IconComponent;
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-activity-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearOldActivities = () => {
    if (!confirm('¿Seguro que quieres eliminar actividades antiguas (más de 30 días)?')) return;
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filtered = activities.filter((a) => a.timestamp >= monthAgo);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(filtered));
    setActivities(filtered);
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <History className="text-indigo-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historial de Actividades de Administradores</h2>
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold">{filteredActivities.length}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filtro por tipo */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="all">Todos los tipos</option>
                <option value="user">Usuarios</option>
                <option value="post">Posts</option>
                <option value="comment">Comentarios</option>
              </select>
            </div>

            {/* Filtro por tiempo */}
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>

            {/* Botón exportar */}
            <button onClick={exportToJSON} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
              <Download size={16} />
              Exportar
            </button>

            {/* Botón limpiar */}
            <button onClick={clearOldActivities} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">Registro de todas las acciones realizadas por administradores en el sistema</p>
      </div>

      <div className="p-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <History className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No hay actividades registradas</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredActivities.map((activity, activityIdx) => {
                const Icon = getIconComponent(activity.icon);
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== filteredActivities.length - 1 && <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className="relative px-1">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.color} ring-8 ring-white dark:ring-gray-800`}>
                              <Icon className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-semibold">{activity.adminEmail}</span> <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{activity.targetType}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{activity.targetName}</span>
                            </div>
                            {activity.details && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{activity.details}</p>}
                          </div>
                          <div className="whitespace-nowrap text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{getTimeAgo(activity.timestamp)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {activity.timestamp.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Función helper para registrar actividades (exportada para usar en otros componentes)
export function logAdminActivity(activity: Omit<AdminActivity, 'id' | 'timestamp'>) {
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const activities: AdminActivity[] = stored ? JSON.parse(stored) : [];

    const newActivity: AdminActivity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    activities.unshift(newActivity);

    // Mantener solo las últimas 1000 actividades
    const trimmed = activities.slice(0, 1000);

    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed));

    // Disparar evento personalizado para actualizar el componente
    window.dispatchEvent(new Event('adminActivityUpdate'));
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}
