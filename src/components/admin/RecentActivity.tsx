'use client';
import { Activity, UserPlus, FileText, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUsers, getPosts, getComments } from '@/services/adminService';

interface ActivityItem {
  id: string;
  type: 'user' | 'post' | 'comment';
  userName: string;
  action: string;
  time: Date;
  icon: typeof UserPlus;
  color: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Obtener datos recientes
      const [usersData, postsData, commentsData] = await Promise.all([getUsers({ page: 1, limit: 10 }), getPosts({ page: 1, limit: 10 }), getComments({ page: 1, limit: 10 })]);

      // Crear actividades
      const userActivities: ActivityItem[] = usersData.users.map((user) => ({
        id: `user-${user.id}`,
        type: 'user' as const,
        userName: user.name || user.username || user.email.split('@')[0],
        action: 'se registró en la plataforma',
        time: new Date(user.createdAt),
        icon: UserPlus,
        color: 'text-green-500',
      }));

      const postActivities: ActivityItem[] = postsData.posts.map((post) => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        userName: post.user.name || post.user.username || post.user.email.split('@')[0],
        action: 'publicó un nuevo post',
        time: new Date(post.createdAt),
        icon: FileText,
        color: 'text-blue-500',
      }));

      const commentActivities: ActivityItem[] = commentsData.comments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: 'comment' as const,
        userName: comment.user.name || comment.user.username || comment.user.email.split('@')[0],
        action: 'comentó en un post',
        time: new Date(comment.createdAt),
        icon: MessageSquare,
        color: 'text-purple-500',
      }));

      // Combinar y ordenar por fecha
      const allActivities = [...userActivities, ...postActivities, ...commentActivities].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 15);

      setActivities(allActivities);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actividad Reciente</h2>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando actividades...</div>
      ) : (
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => {
                const Icon = activity.icon;
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 && <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className={`relative px-1`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 ring-8 ring-white dark:ring-gray-800">
                              <Icon className={activity.color} size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{activity.userName}</span> <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">{getTimeAgo(activity.time)}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
