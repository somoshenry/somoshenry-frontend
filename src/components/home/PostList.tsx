'use client';
import Post from './Post';
import { PostType } from '../../interfaces/interfaces.post/post';

interface Props {
  posts?: PostType[] | null; // ⚙️ puede venir vacío o undefined
  onUpdatePost?: (post: PostType) => void;
}

export default function PostList({ posts = [], onUpdatePost }: Props) {
  //  Garantiza que siempre tengamos un array
  const safePosts = Array.isArray(posts) ? posts : [];

  if (safePosts.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No hay publicaciones disponibles 😅
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {safePosts.map((post) => (
        <Post
          key={post.id}
          post={post}
          // En caso de que onUpdatePost no se pase
          onUpdatePost={onUpdatePost || (() => {})}
        />
      ))}
    </div>
  );
}
