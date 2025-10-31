// 🔹 Usuario
export interface UserType {
  id: number;
  name: string;
  avatar: string; // Ruta o URL de la imagen
}

// 🔹 Comentario
export interface CommentType {
  id: number;
  text: string;
  createdAt: string;
  user: UserType;

  // Opcional: contador de likes en cada comentario
  likes?: number;
}

// 🔹 Post o Publicación
export interface PostType {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  user: UserType;
  comments: CommentType[];

  // Campos multimedia (opcional)
  mediaUrl?: string | null; // URL de la imagen o video
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
