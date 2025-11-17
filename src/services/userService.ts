import { SubscriptionPlan } from '@/interfaces/context/auth';
import { api } from './api';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan; // BRONCE | PLATA | ORO
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  coverPicture?: string | null;
  biography?: string | null;
  location?: string | null;
  website?: string | null;
  joinDate?: string | null;
  role: 'ADMIN' | 'TEACHER' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;

  // SUSCRIPCIÓN - Lo que el backend devuelve
  subscriptionPlan?: SubscriptionPlan; // 'BRONCE' | 'PLATA' | 'ORO' (del backend)
  subscription?: SubscriptionPlan; // Alias para compatibilidad con componentes
  subscriptionExpiresAt?: string | null; // Fecha de vencimiento

  // LEGADO - Por compatibilidad con componentes antiguos
  suscriptions?: Subscription[];
}

export interface UserProfileResponse {
  message: string;
  user: User;
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getUserProfile(): Promise<User> {
  const { data } = await api.get<UserProfileResponse>('/users/me');
  const user = data.user;

  console.log('📡 getUserProfile - Respuesta del backend:', {
    subscriptionPlan: user.subscriptionPlan,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    subscription: user.subscription,
  });

  // Mapear subscriptionPlan (del backend) a subscription (para componentes)
  // Solo mapear si es string y subscription no existe
  if (user.subscriptionPlan && typeof user.subscriptionPlan === 'string' && !user.subscription) {
    console.log('✅ Mapeando subscriptionPlan a subscription:', user.subscriptionPlan);
    user.subscription = user.subscriptionPlan as any;
  }
  return user;
}
/**
 * Obtiene el perfil de un usuario por ID
 */
export async function getUserById(userId: string): Promise<User> {
  const { data } = await api.get<UserProfileResponse>(`/users/${userId}`);
  const user = data.user;
  // Mapear subscriptionPlan (del backend) a subscription (para componentes)
  if (user.subscriptionPlan && typeof user.subscriptionPlan === 'string' && !user.subscription) {
    user.subscription = user.subscriptionPlan as any;
  }
  return user;
}

/**
 * Actualiza el perfil del usuario autenticado
 */
export async function updateUserProfile(updates: {
  name?: string;
  lastName?: string;
  biography?: string;
  location?: string;
  website?: string;
  profilePicture?: string;
  coverPicture?: string;
  username?: string;
}): Promise<User> {
  const { data } = await api.patch<UserProfileResponse>('/users/me', updates);
  const user = data.user;
  // Mapear subscriptionPlan (del backend) a subscription (para componentes)
  if (user.subscriptionPlan && typeof user.subscriptionPlan === 'string' && !user.subscription) {
    user.subscription = user.subscriptionPlan as any;
  }
  return user;
}
