import { Users, FileText, AlertTriangle, MessageSquare, TrendingUp } from 'lucide-react';

export default function StatsOverview() {
  // Datos estáticos de ejemplo
  const stats = [
    {
      title: 'Usuarios Totales',
      value: '1,234',
      change: '+12.5%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Posts Publicados',
      value: '3,456',
      change: '+8.2%',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Posts Reportados',
      value: '23',
      change: '-5.3%',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Comentarios',
      value: '8,912',
      change: '+15.7%',
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      title: 'Usuarios Activos',
      value: '892',
      change: '+6.1%',
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} este mes</p>
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
