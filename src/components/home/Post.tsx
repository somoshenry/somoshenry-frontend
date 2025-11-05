'use client';
import { usePost } from '@/context/PostContext';
import { PostType } from '@/interfaces/interfaces.post/post';
import { formatDateArgentina } from '@/utils/dateFormatter';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import VideoPlayer from './VideoPlayer';
import { useAuth } from '@/hook/useAuth';
import { useRouter } from 'next/navigation';

// Helpers para resolver avatar y nombre sin bloquear dominios
function getAvatar(u: any): string {
  const candidate: string = u?.profilePicture || u?.avatar || '';
  return candidate || '/avatars/default.svg';
}

function getDisplayName(u: any): string {
  if (!u) return 'Usuario';
  if (u.name && u.lastName) return `${u.name} ${u.lastName}`;
  if (u.name) return u.name;
  if (u.email) return String(u.email).split('@')[0];
  return 'Usuario';
}

export default function Post({ post, onUpdatePost }: { post: PostType; onUpdatePost?: (post: PostType) => void }) {
  const { likePost, addComment, reportPost, deletePost } = usePost();
  const { user } = useAuth();
  const router = useRouter();
  const safeComments = post.comments ?? [];
  const likesCount: number = (post as any).likes || 0;
  const likedByMe: boolean = Boolean((post as any).likedByMe);

  // Permiso para borrar: autor o admin
  const canDelete = user && post.user && (user.id === post.user.id || user.role === 'ADMIN');

  // Borrar post
  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este post?')) return;
    try {
      await deletePost(post.id);
    } catch (err) {
      alert('No se pudo borrar el post');
    }
  };

  // Navegar al perfil del usuario
  const handleUserClick = () => {
    if (post.user?.id) {
      router.push(`/user/${post.user.id}`);
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-5 text-black space-y-4">
      {/* Cabecera del post */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="cursor-pointer" onClick={handleUserClick}>
            <Avatar src={getAvatar(post.user)} alt={getDisplayName(post.user)} width={48} height={48} className="rounded-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 cursor-pointer hover:text-yellow-500 transition-colors" onClick={handleUserClick}>
              {getDisplayName(post.user)}
            </p>
            <p className="text-xs text-gray-500">{formatDateArgentina(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => reportPost(post.id)} className="text-gray-400 hover:text-red-500 transition text-sm">
            Reportar
          </button>
          {canDelete && (
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition text-sm" title="Borrar post">
              Borrar
            </button>
          )}
        </div>
      </div>

      {/* Contenido del post */}
      {post.content && <p className="text-gray-800 whitespace-pre-line bg-gray-200 rounded-xl p-3">{post.content}</p>}

      {/* Multimedia */}
      {(post.mediaURL || post.mediaUrl) && <div className="overflow-hidden rounded-xl border border-gray-300">{post.mediaType === 'video' || post.type === 'VIDEO' ? <VideoPlayer src={post.mediaURL || post.mediaUrl || ''} className="w-full rounded-xl max-h-[600px]" /> : <img src={post.mediaURL || post.mediaUrl || ''} alt="media" className="w-full object-cover max-h-[400px] rounded-xl" />}</div>}

      {/* Likes y contador de comentarios */}
      <div className="flex items-center justify-between mt-2">
        <LikeButton likes={likesCount} liked={likedByMe} onLike={() => likePost(post.id)} />
        <span className="text-xs text-gray-500">{safeComments.length} comentarios</span>
      </div>

      {/* Sección de comentarios */}
      <div className="border-t border-gray-300 pt-3">
        <CommentSection comments={safeComments} postId={post.id} />
      </div>
    </div>
  );
}
