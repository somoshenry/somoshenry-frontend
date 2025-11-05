'use client';
import { Users, FileText, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUsers, getPosts, getComments } from '@/services/adminService';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalPosts: number;
  totalComments: number;
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalPosts: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Obtener datos en paralelo
      const [usersData, postsData, commentsData] = await Promise.all([getUsers({ page: 1, limit: 1000 }), getPosts({ page: 1, limit: 1000 }), getComments({ page: 1, limit: 1000 })]);

      // Calcular estadísticas
      const activeUsers = usersData.users.filter((u) => u.status === 'ACTIVE').length;
      const suspendedUsers = usersData.users.filter((u) => u.status === 'SUSPENDED').length;

      setStats({
        totalUsers: usersData.total,
        activeUsers,
        suspendedUsers,
        totalPosts: postsData.total,
        totalComments: commentsData.total,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      loading,
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'bg-green-500',
      loading,
    },
    {
      title: 'Usuarios Suspendidos',
      value: stats.suspendedUsers,
      icon: UserX,
      color: 'bg-red-500',
      loading,
    },
    {
      title: 'Posts Publicados',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-purple-500',
      loading,
    },
    {
      title: 'Comentarios',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                {stat.loading ? <div className="mt-2 h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div> : <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value.toLocaleString()}</p>}
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
