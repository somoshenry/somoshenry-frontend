import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { PostType, CommentType } from '../interfaces/post';

interface Props {
  post: PostType;
  onUpdatePost: (post: PostType) => void;
}

export default function Post({ post, onUpdatePost }: Props) {
  const handleLike = () => {
    const updated = { ...post, likes: post.likes + 1 };
    onUpdatePost(updated);
  };

  const handleAddComment = (comment: CommentType) => {
    const updated = { ...post, comments: [...post.comments, comment] };
    onUpdatePost(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <p>{post.content}</p>
      <LikeButton likes={post.likes} onLike={handleLike} />
      <CommentSection comments={post.comments} onAddComment={handleAddComment} />
    </div>
  );
}
