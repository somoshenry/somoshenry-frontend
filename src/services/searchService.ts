import { api } from './api';

// ============================================
// INTERFACES
// ============================================

export interface SearchUserResult {
  id: string;
  email: string;
  username?: string;
  name?: string;
  lastName?: string;
  profilePicture?: string;
  biography?: string;
  location?: string;
  role: 'ADMIN' | 'TEACHER' | 'TA' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface SearchPostResult {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaURL?: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    lastName?: string;
    profilePicture?: string;
    email: string;
  };
}

export interface UserSearchFilters {
  name?: string;
  role?: 'ADMIN' | 'TEACHER' | 'TA' | 'MEMBER';
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  page?: number;
  limit?: number;
}

export interface PostSearchFilters {
  search?: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO';
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// ============================================
// BÚSQUEDA DE USUARIOS
// ============================================

/**
 * Busca usuarios con filtros avanzados
 */
export async function searchUsers(filters: UserSearchFilters) {
  const params = new URLSearchParams();

  if (filters.name) params.append('name', filters.name);
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const { data } = await api.get(`/users?${params.toString()}`);

  return {
    users: (data?.users || data?.data || []) as SearchUserResult[],
    total: data?.total || 0,
  };
}

/**
 * Búsqueda rápida de usuarios por nombre (para el modal)
 */
export async function quickSearchUsers(query: string, limit = 10) {
  if (!query || query.trim().length < 2) {
    return { users: [], total: 0 };
  }

  return searchUsers({
    name: query.trim(),
    status: 'ACTIVE', // Solo usuarios activos
    limit,
    page: 1,
  });
}

// ============================================
// BÚSQUEDA DE POSTS
// ============================================

/**
 * Busca posts con filtros avanzados
 */
export async function searchPosts(filters: PostSearchFilters) {
  const params: any = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    sortBy: filters.sortBy || 'createdAt',
    order: filters.order || 'DESC',
  };

  if (filters.search) params.search = filters.search;
  if (filters.type) params.type = filters.type;
  if (filters.userId) params.userId = filters.userId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const { data } = await api.get('/posts', { params });

  return {
    posts: (data?.data || []) as SearchPostResult[],
    meta: data?.meta || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  };
}

/**
 * Búsqueda rápida de posts por contenido (para el modal)
 */
export async function quickSearchPosts(query: string, limit = 10) {
  if (!query || query.trim().length < 2) {
    return { posts: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
  }

  return searchPosts({
    search: query.trim(),
    limit,
    page: 1,
  });
}

// ============================================
// BÚSQUEDA GLOBAL (USUARIOS + POSTS)
// ============================================

/**
 * Busca usuarios y posts simultáneamente
 * Útil para barra de búsqueda general
 */
export async function globalSearch(query: string, limit = 5) {
  if (!query || query.trim().length < 2) {
    return {
      users: [],
      posts: [],
      usersTotal: 0,
      postsTotal: 0,
    };
  }

  try {
    // Ejecutar ambas búsquedas en paralelo
    const [usersResult, postsResult] = await Promise.all([quickSearchUsers(query, limit), quickSearchPosts(query, limit)]);

    return {
      users: usersResult.users,
      posts: postsResult.posts,
      usersTotal: usersResult.total,
      postsTotal: postsResult.meta.total,
    };
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    return {
      users: [],
      posts: [],
      usersTotal: 0,
      postsTotal: 0,
    };
  }
}

// ============================================
// BÚSQUEDA POR TIPO DE POST
// ============================================

/**
 * Busca solo posts con imágenes
 */
export async function searchImagePosts(filters?: Omit<PostSearchFilters, 'type'>) {
  return searchPosts({
    ...filters,
    type: 'IMAGE',
  });
}

/**
 * Busca solo posts con videos
 */
export async function searchVideoPosts(filters?: Omit<PostSearchFilters, 'type'>) {
  return searchPosts({
    ...filters,
    type: 'VIDEO',
  });
}

// ============================================
// BÚSQUEDA POR USUARIO
// ============================================

/**
 * Obtiene todos los posts de un usuario específico
 */
export async function searchPostsByUser(userId: string, filters?: Omit<PostSearchFilters, 'userId'>) {
  return searchPosts({
    ...filters,
    userId,
  });
}

/**
 * Obtiene posts multimedia de un usuario
 */
export async function searchUserMediaPosts(userId: string) {
  const [images, videos] = await Promise.all([searchPosts({ userId, type: 'IMAGE', limit: 100 }), searchPosts({ userId, type: 'VIDEO', limit: 100 })]);

  return {
    posts: [...images.posts, ...videos.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    total: images.meta.total + videos.meta.total,
  };
}

// ============================================
// BÚSQUEDA POR RANGO DE FECHAS
// ============================================

/**
 * Busca posts en un rango de fechas
 */
export async function searchPostsByDateRange(dateFrom: string, dateTo: string, filters?: Omit<PostSearchFilters, 'dateFrom' | 'dateTo'>) {
  return searchPosts({
    ...filters,
    dateFrom,
    dateTo,
  });
}

/**
 * Busca posts de hoy
 */
export async function searchTodayPosts(filters?: PostSearchFilters) {
  const today = new Date().toISOString().split('T')[0];
  return searchPostsByDateRange(today, today, filters);
}

/**
 * Busca posts de esta semana
 */
export async function searchWeekPosts(filters?: PostSearchFilters) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  return searchPostsByDateRange(weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0], filters);
}
