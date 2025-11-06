import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  role: 'ADMIN' | 'TEACHER' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  message: string;
  total: number;
  users: AdminUser[];
}

/**
 * Obtiene la lista de usuarios con filtros opcionales
 */
export async function getUsers(params?: { page?: number; limit?: number; name?: string; role?: 'ADMIN' | 'TEACHER' | 'MEMBER'; status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED' }): Promise<{ users: AdminUser[]; total: number }> {
  const { data } = await api.get<UsersListResponse>('/users', { params });
  return { users: data.users, total: data.total };
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: string): Promise<AdminUser> {
  const { data } = await api.get<{ message: string; user: AdminUser }>(`/users/${userId}`);
  return data.user;
}

/**
 * Elimina un usuario (soft delete - solo admin)
 */
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

/**
 * Restaura un usuario eliminado (solo admin)
 */
export async function restoreUser(userId: string): Promise<void> {
  await api.patch(`/users/restore/${userId}`);
}

/**
 * Elimina un usuario permanentemente (solo admin)
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  await api.delete(`/users/hard/${userId}`);
}

/**
 * Actualiza un usuario (solo admin)
 */
export async function updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
  const { data } = await api.patch<{ message: string; user: AdminUser }>(`/users/${userId}`, updates);
  return data.user;
}

// ==================== POSTS ====================

export interface AdminPost {
  id: string;
  title?: string;
  content: string;
  type: string;
  mediaURL?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
  };
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface PostsListResponse {
  message: string;
  total: number;
  posts: AdminPost[];
}

/**
 * Obtiene la lista de posts con filtros opcionales
 */
export async function getPosts(params?: { page?: number; limit?: number }): Promise<{ posts: AdminPost[]; total: number }> {
  const { data } = await api.get<{ message: string; total: number; posts: AdminPost[] }>('/posts', { params });
  return { posts: data.posts, total: data.total };
}

/**
 * Obtiene un post por ID (para conseguir información del autor)
 */
export async function getPostById(postId: string): Promise<AdminPost | null> {
  try {
    const { data } = await api.get<AdminPost>(`/posts/${postId}`);
    return data;
  } catch (error) {
    console.error('Error al obtener post:', error);
    return null;
  }
}

/**
 * Elimina un post (solo admin o autor)
 */
export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/posts/${postId}`);
}

// ==================== DASHBOARD STATS ====================

// DTO que devuelve el backend
interface BackendAdminStatsDTO {
  usersTotal: number;
  usersActive30d: number;
  postsTotal: number;
  commentsTotal: number;
  postsReportedPending: number;
  commentsReportedPending: number;
  postsFlagged: number;
  likesTotal: number;
  dislikesTotal: number;
  viewsTotal: number;
  trend: {
    users: number;
    posts: number;
    comments: number;
  };
}

// Interfaz que usamos en el frontend
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
  totalTeachers: number;
  totalAdmins: number;
}

/**
 * Obtiene las estadísticas del dashboard de admin
 */
export async function getDashboardStats(): Promise<AdminStats> {
  // Obtener datos del backend y de usuarios en paralelo
  const [backendStats, usersData] = await Promise.all([
    api.get<BackendAdminStatsDTO>('/dashboard/admin/stats'),
    getUsers({ page: 1, limit: 1000 }), // Obtener todos los usuarios para calcular estadísticas
  ]);

  const stats = backendStats.data;

  // Calcular estadísticas de usuarios
  const activeUsers = usersData.users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsers = usersData.users.filter((u) => u.status === 'SUSPENDED').length;
  const deletedUsers = usersData.users.filter((u) => u.status === 'DELETED').length;
  const totalAdmins = usersData.users.filter((u) => u.role === 'ADMIN').length;
  const totalTeachers = usersData.users.filter((u) => u.role === 'TEACHER').length;

  return {
    totalUsers: stats.usersTotal || 0,
    activeUsers,
    suspendedUsers,
    deletedUsers,
    totalPosts: stats.postsTotal || 0,
    totalComments: stats.commentsTotal || 0,
    totalReports: (stats.postsReportedPending || 0) + (stats.commentsReportedPending || 0),
    pendingReports: (stats.postsReportedPending || 0) + (stats.commentsReportedPending || 0),
    totalTeachers,
    totalAdmins,
  };
}

// ==================== POSTS MODERADOS Y REPORTADOS ====================

/**
 * Obtiene posts moderados (marcados como inapropiados)
 */
export async function getModeratedPosts(params?: { page?: number; limit?: number }): Promise<{ posts: AdminPost[]; total: number }> {
  const { data } = await api.get<{ message: string; total: number; posts: AdminPost[] }>('/posts/moderated', { params });
  return { posts: data.posts, total: data.total };
}

/**
 * Obtiene posts reportados
 */
export async function getReportedPosts(params?: { page?: number; limit?: number }): Promise<{ posts: AdminPost[]; total: number }> {
  const { data } = await api.get<{ message: string; total: number; posts: AdminPost[] }>('/posts/reported', { params });
  return { posts: data.posts, total: data.total };
}

/**
 * Modera un post (marca como inapropiado o lo desmodera)
 */
export async function moderatePost(postId: string, isInappropriate: boolean): Promise<AdminPost> {
  const { data } = await api.patch<{ message: string; post: AdminPost }>(`/posts/${postId}/moderate`, { isInappropriate });
  return data.post;
}

// ==================== REPORTES ====================

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE = 'INAPPROPRIATE',
  MISINFORMATION = 'MISINFORMATION',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: {
    id: string;
    email: string;
    username?: string | null;
    name?: string | null;
    lastName?: string | null;
  };
  postId?: string | null;
  post?: AdminPost | null;
  commentId?: string | null;
  comment?: {
    id: string;
    content: string;
    user: {
      id: string;
      email: string;
      username?: string | null;
      name?: string | null;
      lastName?: string | null;
    };
  } | null;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  reviewedBy?: string | null;
  reviewer?: {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
  } | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportedPostsResponse {
  data: Array<{
    post: AdminPost;
    reports: Report[];
    reportCount: number;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface ReportedCommentsResponse {
  data: Array<{
    comment: {
      id: string;
      content: string;
      user: {
        id: string;
        email: string;
        username?: string | null;
        name?: string | null;
        lastName?: string | null;
      };
    };
    reports: Report[];
    reportCount: number;
  }>;
  total: number;
  page: number;
  limit: number;
}

/**
 * Crea un nuevo reporte
 */
export async function createReport(dto: { postId?: string; commentId?: string; reason: ReportReason; description?: string }): Promise<Report> {
  const { data } = await api.post<{ message: string; report: Report }>('/reports', dto);
  return data.report;
}

/**
 * Obtiene reportes pendientes
 */
export async function getPendingReports(): Promise<Report[]> {
  const { data } = await api.get<{ data: Report[] }>('/reports/pending');
  return data.data;
}

/**
 * Obtiene todos los reportes con filtro opcional por estado
 */
export async function getAllReports(status?: ReportStatus): Promise<Report[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<{ data: Report[] }>('/reports', { params });
  return data.data;
}

/**
 * Actualiza el estado de un reporte
 */
export async function updateReportStatus(reportId: string, status: ReportStatus): Promise<Report> {
  const { data } = await api.patch<{ message: string; report: Report }>(`/reports/${reportId}/status`, { status });
  return data.report;
}

/**
 * Obtiene posts reportados desde el dashboard de admin
 */
export async function getDashboardReportedPosts(params?: { page?: number; limit?: number }): Promise<ReportedPostsResponse> {
  const { data } = await api.get<ReportedPostsResponse>('/dashboard/admin/reported-posts', { params });
  return data;
}

/**
 * Obtiene comentarios reportados desde el dashboard de admin
 */
export async function getDashboardReportedComments(params?: { page?: number; limit?: number }): Promise<ReportedCommentsResponse> {
  const { data } = await api.get<ReportedCommentsResponse>('/dashboard/admin/reported-comments', { params });
  return data;
}

/**
 * Elimina un comentario (soft delete - marca isDeleted = true)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/comment/${commentId}`);
}

// Nota: No hay endpoint para obtener todos los comentarios en el backend
// La función getComments está deshabilitada hasta que se implemente
