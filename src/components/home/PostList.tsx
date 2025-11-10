'use client';
import Post from './Post';
import { PostType } from '../../interfaces/interfaces.post/post';

interface Props {
  posts?: PostType[] | null; // ⚙️ puede venir vacío o undefined
  onUpdatePost?: (post: PostType) => void;
}

export default function PostList({ posts = [], onUpdatePost }: Props) {
  //  Garantiza que siempre tengamos un array y elimina duplicados por ID
  const safePosts = Array.isArray(posts) ? posts.filter((post, index, self) => index === self.findIndex((p) => p.id === post.id)) : [];

  if (safePosts.length === 0) {
    return <p className="text-center text-gray-500">No hay publicaciones disponibles 😅</p>;
  }

  return (
    <div className="space-y-4">
      {safePosts.map((post) => (
        <Post key={post.id} post={post} onUpdatePost={onUpdatePost || (() => {})} />
      ))}
    </div>
  );
}
