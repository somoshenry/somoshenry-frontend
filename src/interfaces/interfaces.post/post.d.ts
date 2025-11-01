// 🔹 Usuario en Post
export interface UserType {
  id: string;
  email: string;
  name?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
}

// 🔹 Comentario
export interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  author: UserType;
}

// 🔹 Like en Post
export interface PostLikeType {
  id: string;
  userId: string;
  postId: string;
}

// 🔹 Post o Publicación
export interface PostType {
  id: string;
  userId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaURL?: string | null;
  isInappropriate: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserType;
  comments: CommentType[];
  likes: PostLikeType[];
}

// Cuando el backend devuelve un solo post
export interface PostResponse {
  success: boolean;
  message?: string;
  data: PostType;
}

// Cuando el backend devuelve varios posts
export interface PostsResponse {
  success: boolean;
  message?: string;
  data: PostType[];
}

// Cuando se crea o actualiza un comentario
export interface CommentResponse {
  success: boolean;
  message?: string;
  data: CommentType;
}
