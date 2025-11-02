import { api } from './api';

export interface PostUser {
  id: string;
  email: string;
  name?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: PostUser;
}

export interface PostLike {
  id: string;
  userId: string;
  postId: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaURL?: string | null;
  isInappropriate: boolean;
  createdAt: string;
  updatedAt: string;
  user: PostUser;
  comments?: PostComment[];
  likes?: PostLike[];
}

export interface PostsResponse {
  message: string;
  data: Post[];
  total: number;
}

export interface PostResponse {
  message: string;
  data: Post;
}

/**
 * Obtiene todos los posts paginados
 */
export async function getAllPosts(page = 1, limit = 10): Promise<{ posts: Post[]; total: number }> {
  const { data } = await api.get<PostsResponse>('/posts', {
    params: { page, limit },
  });
  return { posts: data.data, total: data.total };
}

/**
 * Obtiene un post por ID
 */
export async function getPostById(postId: string): Promise<Post> {
  const { data } = await api.get<PostResponse>(`/posts/${postId}`);
  return data.data;
}

/**
 * Obtiene los posts de un usuario específico
 * Nota: Filtramos del lado del cliente ya que el backend no tiene endpoint específico
 */
export async function getUserPosts(userId: string): Promise<Post[]> {
  // Obtenemos todos los posts y filtramos por userId
  const { data } = await api.get<PostsResponse>('/posts', {
    params: { page: 1, limit: 100 }, // Traemos más posts para asegurar tener todos del usuario
  });
  return data.data.filter((post) => post.userId === userId);
}

/**
 * Obtiene solo los posts con multimedia de un usuario
 */
export async function getUserMediaPosts(userId: string): Promise<Post[]> {
  const userPosts = await getUserPosts(userId);
  console.log('Todos los posts del usuario:', userPosts);
  
  // Filtra posts que tengan mediaURL o mediaUrl (compatibilidad con ambos campos)
  const mediaPosts = userPosts.filter((post) => {
    const hasMedia = post.mediaURL || (post as any).mediaUrl;
    console.log(`Post ${post.id}: type=${post.type}, mediaURL=${post.mediaURL}, mediaUrl=${(post as any).mediaUrl}, hasMedia=${hasMedia}`);
    return !!hasMedia; // Retorna cualquier post con media, independientemente del tipo
  });
  
  console.log('Posts filtrados con media:', mediaPosts);
  return mediaPosts;
}

/**
 * Crea un nuevo post
 */
export async function createPost(content: string, type: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT', mediaURL?: string): Promise<Post> {
  const { data } = await api.post<PostResponse>('/posts', {
    content,
    type,
    mediaURL: mediaURL || null,
  });
  return data.data;
}

/**
 * Actualiza un post existente
 */
export async function updatePost(postId: string, updates: { content?: string; mediaURL?: string }): Promise<Post> {
  const { data } = await api.patch<PostResponse>(`/posts/${postId}`, updates);
  return data.data;
}

/**
 * Elimina un post
 */
export async function deletePost(postId: string): Promise<void> {
  await api.delete(`/posts/${postId}`);
}
