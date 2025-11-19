'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, AlertCircle, Calendar, Award } from 'lucide-react';
import { getAdminDashboardStats, getSubscriptionsByPlan, getRecentPayments, getUpcomingRenewals, getChurnRate, getLTV, type DashboardStats, type SubscriptionsByPlan, type RecentPayment, type UpcomingRenewal, type ChurnRate as ChurnRateType, type LTVData, SubscriptionPlan } from '@/services/subscriptionService';

export default function SubscriptionMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [planDistribution, setPlanDistribution] = useState<SubscriptionsByPlan[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState<UpcomingRenewal[]>([]);
  const [churnRate, setChurnRate] = useState<ChurnRateType | null>(null);
  const [ltv, setLtv] = useState<LTVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsData, planData, paymentsData, renewalsData, churnData, ltvData] = await Promise.all([getAdminDashboardStats(), getSubscriptionsByPlan(), getRecentPayments(1, 20), getUpcomingRenewals(7), getChurnRate(), getLTV()]);

      setStats(statsData);
      // Ordenar planes por cantidad (más contratado primero)
      const sortedPlans = [...planData].sort((a, b) => b.count - a.count);
      setPlanDistribution(sortedPlans);
      setRecentPayments(paymentsData.data);
      setUpcomingRenewals(renewalsData);
      setChurnRate(churnData);
      setLtv(ltvData);
    } catch (error) {
      console.error('Error al cargar métricas de suscripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando métricas de suscripciones...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-yellow-600 dark:text-yellow-400 mb-2" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se pudieron cargar las métricas</h3>
        <p className="text-gray-600 dark:text-gray-400">Verifica que el backend esté funcionando correctamente</p>
      </div>
    );
  }

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.BRONCE:
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case SubscriptionPlan.PLATA:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case SubscriptionPlan.ORO:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Métricas de Suscripciones</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estadísticas de pagos, planes y rendimiento financiero</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Suscripciones Activas</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeSubscriptions}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">de {stats.totalSubscriptions} totales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp size={14} />
              MRR
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ingresos Mensuales</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(stats.averageRevenuePerUser)} por usuario</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
              <CreditCard size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pagos Recientes</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.recentPayments}</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{stats.failedPayments} fallidos</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
              <Award size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Lifetime Value</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{ltv ? formatCurrency(ltv.averageLTV) : '-'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio por cliente</p>
        </div>
      </div>

      {/* Plan Distribution & Churn Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribución por Plan</h3>
          <div className="space-y-4">
            {planDistribution.map((plan) => (
              <div key={plan.plan} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPlanColor(plan.plan)}`}>{plan.plan}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {plan.count} usuarios ({plan.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${plan.plan === SubscriptionPlan.ORO ? 'bg-yellow-500' : plan.plan === SubscriptionPlan.PLATA ? 'bg-gray-400' : 'bg-orange-500'}`} style={{ width: `${plan.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tasa de Cancelación (Churn Rate)</h3>
          {churnRate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={`text-6xl font-bold ${churnRate.churnRate > 5 ? 'text-red-600' : churnRate.churnRate > 2 ? 'text-yellow-600' : 'text-green-600'}`}>{churnRate.churnRate.toFixed(1)}%</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                {churnRate.churnRate > 5 ? <TrendingDown className="text-red-600" size={20} /> : <TrendingUp className="text-green-600" size={20} />}
                <span className="text-sm text-gray-600 dark:text-gray-400">Período: {churnRate.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inicio del período</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{churnRate.startCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelaciones</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{churnRate.cancelledCount}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Plan Más Contratado */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow-lg border-2 border-yellow-300 dark:border-yellow-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-yellow-600 dark:text-yellow-400" size={32} />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Más Contratado</h3>
        </div>
        {planDistribution.length > 0 ? (
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${getPlanColor(planDistribution[0].plan)}`}>
                {planDistribution[0].plan}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                {planDistribution[0].count} usuarios • {planDistribution[0].percentage.toFixed(1)}% del total
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                {planDistribution[0].percentage.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">de las suscripciones</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
        )}
      </div>

      {/* Recent Payments - Tabla mejorada con fecha y hora */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usuarios Suscritos - Pagos Recientes</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Últimas {recentPayments.length} suscripciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Plan Contratado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Método</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay pagos recientes
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {payment.userName[0]?.toUpperCase() || payment.userEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{payment.userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPlanColor(payment.plan)}`}>
                        {payment.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{payment.paymentMethod}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                        {payment.status === 'completed' ? '✓ Completado' : payment.status === 'pending' ? '⏳ Pendiente' : '✗ Fallido'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(payment.paymentDate).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.paymentDate).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
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

      {/* Upcoming Renewals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Próximas Renovaciones (7 días)</h3>
        </div>
        {upcomingRenewals.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay renovaciones próximas</p>
        ) : (
          <div className="space-y-3">
            {upcomingRenewals.map((renewal) => (
              <div key={renewal.subscriptionId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{renewal.userName[0] || renewal.userEmail[0].toUpperCase()}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{renewal.userName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{renewal.userEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(renewal.plan)}`}>{renewal.plan}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(renewal.amount)} • en {renewal.daysUntilRenewal} días
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
