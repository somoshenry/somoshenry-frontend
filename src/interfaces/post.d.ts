export interface CommentType {
  id: number;
  text: string;
}

export interface PostType {
  id: number;
  content: string;
  likes: number;
  comments: CommentType[];
}