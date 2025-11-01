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
  return data.user;
}

/**
 * Obtiene el perfil de un usuario por ID
 */
export async function getUserById(userId: string): Promise<User> {
  const { data } = await api.get<UserProfileResponse>(`/users/${userId}`);
  return data.user;
}

/**
 * Actualiza el perfil del usuario autenticado
 * NOTA: Este endpoint requiere que el backend tenga PATCH /users/me
 * Si no existe, pedirle al equipo de backend que lo agregue
 */
export async function updateUserProfile(updates: { name?: string; lastName?: string; biography?: string; location?: string; website?: string; joinDate?: string; profilePicture?: string; coverPicture?: string }): Promise<User> {
  const { data } = await api.patch<UserProfileResponse>('/users/me', updates);
  return data.user;
}
