'use client';
import { Users, Ban, Shield, Trash2, User, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUsers, deleteUser, AdminUser } from '@/services/adminService';

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'TEACHER' | 'MEMBER' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'SUSPENDED' | 'DELETED' | ''>('');

  // Cargar usuarios
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (searchTerm) params.name = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const { users: fetchedUsers } = await getUsers(params);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      TEACHER: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      MEMBER: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };
    return styles[role as keyof typeof styles] || styles.MEMBER;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      SUSPENDED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      DELETED: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    };
    return styles[status as keyof typeof styles] || styles.ACTIVE;
  };

  const getDisplayName = (user: AdminUser) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email.split('@')[0];
  };

  const getInitials = (user: AdminUser) => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Filtro por rol */}
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="MEMBER">Member</option>
            </select>
            {/* Filtro por estado */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="SUSPENDED">Suspendido</option>
              <option value="DELETED">Eliminado</option>
            </select>
            {/* Búsqueda */}
            <div className="relative flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={handleSearch} className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No se encontraron usuarios</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">{getInitials(user)}</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{getDisplayName(user)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Ver perfil">
                        <User size={18} />
                      </button>
                      {user.status === 'ACTIVE' ? (
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 opacity-50 cursor-not-allowed" title="Suspender usuario (próximamente)" disabled>
                          <Ban size={18} />
                        </button>
                      ) : user.status === 'SUSPENDED' ? (
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 opacity-50 cursor-not-allowed" title="Activar usuario (próximamente)" disabled>
                          <Shield size={18} />
                        </button>
                      ) : null}
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar usuario">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
