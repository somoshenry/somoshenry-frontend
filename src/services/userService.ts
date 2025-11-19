import { Subscription } from '@/interfaces/context/auth';
import { api } from './api';

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
  subscription?: Subscription | null;
  subscriptionExpiresAt?: string | null;

  // LEGADO
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
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    subscription: user.subscription,
  });

  return user;
}
/**
 * Obtiene el perfil de un usuario por ID
 */
export async function getUserById(userId: string): Promise<User> {
  const { data } = await api.get<UserProfileResponse>(`/users/${userId}`);
  const user = data.user;
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
  return user;
}
