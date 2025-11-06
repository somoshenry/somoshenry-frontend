'use client';
import { Users, FileText, UserCheck, UserX, Shield, GraduationCap, MessageSquare, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardStats, AdminStats } from '@/services/adminService';

export default function StatsOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Refrescar estadísticas cada 30 segundos
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Usuarios Totales',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      loading,
    },
    {
      title: 'Usuarios Activos',
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: 'bg-green-500',
      loading,
    },
    {
      title: 'Usuarios Suspendidos',
      value: stats?.suspendedUsers ?? 0,
      icon: UserX,
      color: 'bg-red-500',
      loading,
    },
    {
      title: 'Administradores',
      value: stats?.totalAdmins ?? 0,
      icon: Shield,
      color: 'bg-purple-500',
      loading,
    },
    {
      title: 'Docentes',
      value: stats?.totalTeachers ?? 0,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      loading,
    },
    {
      title: 'Posts Publicados',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: 'bg-yellow-500',
      loading,
    },
    {
      title: 'Comentarios',
      value: stats?.totalComments ?? 0,
      icon: MessageSquare,
      color: 'bg-cyan-500',
      loading,
    },
    {
      title: 'Reportes Pendientes',
      value: stats?.pendingReports ?? 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                {stat.loading ? <div className="mt-2 h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div> : <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{(stat.value ?? 0).toLocaleString()}</p>}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
