// 🔹 Usuario
export interface UserType {
  id: string;
  name: string;
  avatar: string; // Ruta o URL de la imagen
}

// 🔹 Comentario
export interface CommentType {
  id: string;
  content: string; // El backend usa 'content'
  createdAt: string;
  author: UserType; // El backend usa 'author' en comentarios

  // Opcional: contador de likes en cada comentario
  likeCount: number; // El backend usa 'likeCount'
}

// 🔹 Post o Publicación
export interface PostType {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: UserType; // El backend usa 'user' en posts
  comments: CommentType[];

  // Campos multimedia (opcional)
  mediaURL?: string | null; // El backend usa 'mediaURL'
  mediaUrl?: string | null; // Compatibilidad
  mediaType?: 'image' | 'video' | null; // tipo de archivo
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
