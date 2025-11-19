'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Users, Award, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

interface UserSubscription {
  id: string;
  name?: string;
  lastName?: string;
  email: string;
  subscription?: {
    plan: 'BRONCE' | 'PLATA' | 'ORO';
    status: string;
    startDate: string;
  };
}

export default function SubscriptionMetrics() {
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const userData = response.data?.users || response.data?.data || [];
      setUsers(userData);
      setError(false);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'BRONCE':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50';
      case 'PLATA':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'ORO':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-red-600 dark:text-red-400 mb-2" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 dark:text-gray-400">No se pudieron obtener los usuarios del sistema</p>
      </div>
    );
  }

  // Filtrar usuarios con suscripción activa
  const subscribedUsers = users.filter((user) => user.subscription && user.subscription.status === 'ACTIVE');

  // Contar por plan
  const planCounts = {
    BRONCE: subscribedUsers.filter((u) => u.subscription?.plan === 'BRONCE').length,
    PLATA: subscribedUsers.filter((u) => u.subscription?.plan === 'PLATA').length,
    ORO: subscribedUsers.filter((u) => u.subscription?.plan === 'ORO').length,
  };

  const totalSubscribed = subscribedUsers.length;
  const planDistribution = [
    { plan: 'ORO', count: planCounts.ORO, percentage: totalSubscribed > 0 ? (planCounts.ORO / totalSubscribed) * 100 : 0 },
    { plan: 'PLATA', count: planCounts.PLATA, percentage: totalSubscribed > 0 ? (planCounts.PLATA / totalSubscribed) * 100 : 0 },
    { plan: 'BRONCE', count: planCounts.BRONCE, percentage: totalSubscribed > 0 ? (planCounts.BRONCE / totalSubscribed) * 100 : 0 },
  ].sort((a, b) => b.count - a.count);

  const mostPopularPlan = planDistribution[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Métricas de Suscripciones</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estadísticas de usuarios y planes contratados</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Usuarios</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subscribedUsers.length} con suscripción activa</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
              <DollarSign size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Suscripciones Activas</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{subscribedUsers.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalSubscribed > 0 ? `${((subscribedUsers.length / users.length) * 100).toFixed(1)}% del total` : 'Sin suscripciones'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
              <Award size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Plan Más Popular</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{mostPopularPlan.count > 0 ? mostPopularPlan.plan : '-'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mostPopularPlan.count} usuarios</p>
        </div>
      </div>

      {/* Distribución por Plan */}
      {totalSubscribed > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow-lg border-2 border-yellow-300 dark:border-yellow-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-yellow-600 dark:text-yellow-400" size={32} />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Distribución de Planes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planDistribution.map((plan) => (
              <div key={plan.plan} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPlanColor(plan.plan)}`}>{plan.plan}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${plan.plan === 'ORO' ? 'bg-yellow-500' : plan.plan === 'PLATA' ? 'bg-gray-400' : 'bg-orange-500'}`}
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{plan.percentage.toFixed(1)}% del total</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Usuarios Suscritos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usuarios Suscritos</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{subscribedUsers.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha de Inicio</th>
              </tr>
            </thead>
            <tbody>
              {subscribedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay usuarios con suscripciones activas
                  </td>
                </tr>
              ) : (
                subscribedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {(user.name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.name && user.lastName ? `${user.name} ${user.lastName}` : user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPlanColor(user.subscription?.plan || '')}`}>
                        {user.subscription?.plan || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        ✓ Activo
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.subscription?.startDate
                            ? new Date(user.subscription.startDate).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Todos los Usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Todos los Usuarios</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} usuarios totales</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado de Suscripción</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-bold text-xs">
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name && user.lastName ? `${user.name} ${user.lastName}` : user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.subscription && user.subscription.status === 'ACTIVE' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Suscrito
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        Sin Suscripción
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {user.subscription && user.subscription.status === 'ACTIVE' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(user.subscription.plan)}`}>
                        {user.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
