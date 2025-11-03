import { Users, Ban, Shield, Crown, User, Search } from 'lucide-react';

export default function UserManagement() {
  // Datos estáticos de ejemplo
  const users = [
    {
      id: 1,
      name: 'Ana Martínez',
      email: 'ana@example.com',
      plan: 'Premium',
      status: 'Activo',
      joinDate: '2024-01-15',
      posts: 45,
    },
    {
      id: 2,
      name: 'Pedro Sánchez',
      email: 'pedro@example.com',
      plan: 'Free',
      status: 'Activo',
      joinDate: '2024-03-20',
      posts: 12,
    },
    {
      id: 3,
      name: 'Laura Fernández',
      email: 'laura@example.com',
      plan: 'Pro',
      status: 'Activo',
      joinDate: '2024-02-10',
      posts: 78,
    },
    {
      id: 4,
      name: 'Miguel Torres',
      email: 'miguel@example.com',
      plan: 'Free',
      status: 'Baneado',
      joinDate: '2024-05-05',
      posts: 5,
    },
    {
      id: 5,
      name: 'Sofia Ramírez',
      email: 'sofia@example.com',
      plan: 'Premium',
      status: 'Activo',
      joinDate: '2023-12-01',
      posts: 156,
    },
  ];

  const getPlanBadge = (plan: string) => {
    const styles = {
      Premium: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      Pro: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      Free: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };
    return styles[plan as keyof typeof styles] || styles.Free;
  };

  const getStatusBadge = (status: string) => {
    return status === 'Activo' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar usuarios..." className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">{user.name.charAt(0)}</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(user.plan)}`}>{user.plan}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>{user.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.posts}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <User size={18} />
                    </button>
                    {user.status === 'Activo' ? (
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Ban size={18} />
                      </button>
                    ) : (
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        <Shield size={18} />
                      </button>
                    )}
                    {user.plan !== 'Premium' && (
                      <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                        <Crown size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
