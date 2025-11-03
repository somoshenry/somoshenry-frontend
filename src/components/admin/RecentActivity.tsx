import { Activity, UserPlus, FileText, Trash2, AlertTriangle, Shield } from 'lucide-react';

export default function RecentActivity() {
  // Datos estáticos de ejemplo
  const activities = [
    {
      id: 1,
      type: 'new_user',
      user: 'Carlos Mendoza',
      action: 'se registró en la plataforma',
      time: 'Hace 5 minutos',
      icon: UserPlus,
      color: 'text-green-500',
    },
    {
      id: 2,
      type: 'new_post',
      user: 'Ana López',
      action: 'publicó un nuevo post',
      time: 'Hace 12 minutos',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      id: 3,
      type: 'report',
      user: 'Sistema',
      action: 'detectó un post reportado',
      time: 'Hace 23 minutos',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      id: 4,
      type: 'deleted_post',
      user: 'Admin',
      action: 'eliminó un post inapropiado',
      time: 'Hace 1 hora',
      icon: Trash2,
      color: 'text-orange-500',
    },
    {
      id: 5,
      type: 'banned_user',
      user: 'Admin',
      action: 'baneó a un usuario por violar normas',
      time: 'Hace 2 horas',
      icon: Shield,
      color: 'text-purple-500',
    },
    {
      id: 6,
      type: 'new_user',
      user: 'María Gómez',
      action: 'se registró en la plataforma',
      time: 'Hace 3 horas',
      icon: UserPlus,
      color: 'text-green-500',
    },
    {
      id: 7,
      type: 'new_post',
      user: 'Jorge Ramírez',
      action: 'publicó un nuevo post',
      time: 'Hace 4 horas',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      id: 8,
      type: 'report',
      user: 'Sistema',
      action: 'detectó un comentario reportado',
      time: 'Hace 5 horas',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actividad Reciente</h2>
        </div>
      </div>

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
                            <span className="font-medium">{activity.user}</span> <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
