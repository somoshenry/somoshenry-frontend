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
  await api.patch(`/users/${userId}/restore`);
}

/**
 * Elimina un usuario permanentemente (solo admin)
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}/hard-delete`);
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
  multimedia?: string | null;
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
  const { data } = await api.get<PostsListResponse>('/post', { params });
  return { posts: data.posts, total: data.total };
}

/**
 * Elimina un post (solo admin o autor)
 */
export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/post/${postId}`);
}

// ==================== COMMENTS ====================

export interface AdminComment {
  id: string;
  content: string;
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
  post: {
    id: string;
    title?: string;
    content: string;
  };
}

export interface CommentsListResponse {
  message: string;
  total: number;
  comments: AdminComment[];
}

/**
 * Obtiene la lista de comentarios
 */
export async function getComments(params?: { page?: number; limit?: number }): Promise<{ comments: AdminComment[]; total: number }> {
  const { data } = await api.get<CommentsListResponse>('/comment', { params });
  return { comments: data.comments, total: data.total };
}

/**
 * Elimina un comentario (solo admin o autor)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/comment/${commentId}`);
}
