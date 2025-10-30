export interface UserType {
  id: number;
  name: string;
  avatar: string; // Ruta o URL a la imagen
}

export interface CommentType {
  id: number;
  text: string;
  createdAt: string;
  user: UserType;
}

export interface PostType {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  user: UserType;
  comments: CommentType[];
}
