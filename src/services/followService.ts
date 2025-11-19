import { api } from './api';

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface FollowListsResponse {
  followers: FollowUser[];
  following: FollowUser[];
}

/**
 * Seguir a un usuario
 */
export const followUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await api.post(`/follows/${userId}`);
    return { success: true, message: data?.message || 'Ahora sigues al usuario' };
  } catch (error: any) {
    // Si el backend no está disponible o no tiene la funcionalidad
    if (error?.response?.status === 404) {
      return { success: false, message: 'Funcionalidad de seguimiento no disponible en el backend' };
    }
    console.error('Error al seguir usuario:', error);
    return { success: false, message: 'Error al seguir usuario' };
  }
};

/**
 * Dejar de seguir a un usuario
 */
export const unfollowUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await api.delete(`/follows/unfollow/${userId}`);
    return { success: true, message: data?.message || 'Has dejado de seguir al usuario' };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { success: false, message: 'Funcionalidad de seguimiento no disponible en el backend' };
    }
    console.error('Error al dejar de seguir usuario:', error);
    return { success: false, message: 'Error al dejar de seguir usuario' };
  }
};

/**
 * Verificar si el usuario actual sigue a otro usuario
 * Nota: El backend no tiene un endpoint específico, así que verificamos en la lista
 */
export const checkFollowStatus = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Obtener la lista de usuarios que sigue el usuario actual
    const followingResponse = await api.get(`/follows/siguiendo/${currentUserId}`);
    const following = followingResponse.data ?? [];

    // Verificar si targetUserId está en la lista
    const isFollowing = following.some((user: FollowUser) => user.id === targetUserId);

    return isFollowing;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn('Endpoint de seguimiento no disponible');
      return false;
    }
    console.error('Error al verificar estado de seguimiento:', error);
    return false;
  }
};
/**
 * Obtener estadísticas de seguidores y seguidos
 */
export const getFollowStats = async (userId: string): Promise<FollowStats> => {
  try {
    // Llamar a los dos endpoints separados que existen en el backend
    const [followersResponse, followingResponse] = await Promise.all([api.get(`/follows/seguidores/${userId}/count`), api.get(`/follows/siguiendo/${userId}/count`)]);

    return {
      followersCount: followersResponse.data?.count ?? 0,
      followingCount: followingResponse.data?.count ?? 0,
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn('Endpoint de estadísticas de seguimiento no disponible');
      return { followersCount: 0, followingCount: 0 };
    }
    console.error('Error al obtener estadísticas de seguimiento:', error);
    return { followersCount: 0, followingCount: 0 };
  }
};

/**
 * Obtener listas de seguidores y seguidos de un usuario
 */
export const getFollowLists = async (userId: string): Promise<FollowListsResponse> => {
  try {
    // Llamar a los dos endpoints separados que existen en el backend
    const [followersResponse, followingResponse] = await Promise.all([api.get(`/follows/seguidores/${userId}`), api.get(`/follows/siguiendo/${userId}`)]);

    return {
      followers: followersResponse.data ?? [],
      following: followingResponse.data ?? [],
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn('Endpoint de listas de seguimiento no disponible');
      return { followers: [], following: [] };
    }
    console.error('Error al obtener listas de seguimiento:', error);
    return { followers: [], following: [] };
  }
};
