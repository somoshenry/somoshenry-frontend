import Post from './Post';
import { PostType } from '../interfaces/post';

interface Props {
  posts: PostType[];
  onUpdatePost: (post: PostType) => void;
}

export default function PostList({ posts, onUpdatePost }: Props) {
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Post key={post.id} post={post} onUpdatePost={onUpdatePost} />
      ))}
    </div>
  );
}
