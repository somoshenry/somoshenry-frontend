import { api } from './api';

export enum SubscriptionPlan {
  BRONCE = 'BRONCE',
  PLATA = 'PLATA',
  ORO = 'ORO',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  paymentDate: string;
  createdAt: string;
}

// ==================== USUARIO ====================

export const getMySubscription = async () => {
  const { data } = await api.get('/subscription/current');
  return data;
};

// ==================== ADMIN - DASHBOARD STATS ====================

export interface DashboardStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerUser: number;
  subscriptionsByPlan: {
    BRONCE: number;
    PLATA: number;
    ORO: number;
  };
  recentPayments: number;
  failedPayments: number;
  churnRate: number;
  lifetimeValue: number;
}

/**
 * Obtiene estadísticas generales del dashboard de admin
 */
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/admin/dashboard/stats');
  return data;
}

/**
 * Obtiene ingresos por período
 */
export interface RevenueData {
  period: string;
  revenue: number;
  paymentCount: number;
}

export async function getRevenue(params?: { period?: 'day' | 'week' | 'month' | 'year'; startDate?: string; endDate?: string }): Promise<RevenueData[]> {
  const { data } = await api.get<RevenueData[]>('/admin/dashboard/revenue', { params });
  return data;
}

/**
 * Obtiene distribución de suscripciones por plan
 */
export interface SubscriptionsByPlan {
  plan: SubscriptionPlan;
  count: number;
  percentage: number;
}

export async function getSubscriptionsByPlan(): Promise<SubscriptionsByPlan[]> {
  const { data } = await api.get<SubscriptionsByPlan[]>('/admin/dashboard/subscriptions/by-plan');
  return data;
}

/**
 * Obtiene crecimiento de suscripciones por mes
 */
export interface SubscriptionGrowth {
  month: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  netGrowth: number;
}

export async function getSubscriptionGrowth(months: number = 12): Promise<SubscriptionGrowth[]> {
  const { data } = await api.get<SubscriptionGrowth[]>('/admin/dashboard/subscriptions/growth', { params: { months } });
  return data;
}

/**
 * Obtiene pagos recientes
 */
export interface RecentPayment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  plan: SubscriptionPlan;
  paymentDate: string;
}

export async function getRecentPayments(page: number = 1, limit: number = 20): Promise<{ data: RecentPayment[]; total: number; page: number; limit: number }> {
  const { data } = await api.get<{ data: RecentPayment[]; total: number; page: number; limit: number }>('/admin/dashboard/payments/recent', { params: { page, limit } });
  return data;
}

/**
 * Obtiene pagos fallidos
 */
export async function getFailedPayments(): Promise<RecentPayment[]> {
  const { data } = await api.get<RecentPayment[]>('/admin/dashboard/payments/failed');
  return data;
}

/**
 * Obtiene próximas renovaciones
 */
export interface UpcomingRenewal {
  subscriptionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlan;
  nextBillingDate: string;
  amount: number;
  daysUntilRenewal: number;
}

export async function getUpcomingRenewals(days: number = 7): Promise<UpcomingRenewal[]> {
  const { data } = await api.get<UpcomingRenewal[]>('/admin/dashboard/subscriptions/upcoming-renewals', { params: { days } });
  return data;
}

/**
 * Obtiene tasa de cancelación (churn rate)
 */
export interface ChurnRate {
  period: string;
  startCount: number;
  cancelledCount: number;
  churnRate: number;
}

export async function getChurnRate(): Promise<ChurnRate> {
  const { data } = await api.get<ChurnRate>('/admin/dashboard/subscriptions/churn-rate');
  return data;
}

/**
 * Obtiene el Lifetime Value promedio
 */
export interface LTVData {
  averageLTV: number;
  totalRevenue: number;
  totalCustomers: number;
}

export async function getLTV(): Promise<LTVData> {
  const { data } = await api.get<LTVData>('/admin/dashboard/subscriptions/ltv');
  return data;
}

/**
 * Obtiene usuarios por plan
 */
export interface UsersByPlan {
  plan: SubscriptionPlan;
  activeUsers: number;
  totalUsers: number;
  percentage: number;
}

export async function getUsersByPlan(): Promise<UsersByPlan[]> {
  const { data } = await api.get<UsersByPlan[]>('/admin/dashboard/users/by-plan');
  return data;
}
