'use client';
import { usePost } from '@/context/PostContext';
import { PostType } from '@/interfaces/interfaces.post/post';
import { formatDateArgentina } from '@/utils/dateFormatter';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import Image from 'next/image';

export default function Post({ post }: { post: PostType }) {
  const { likePost, addComment, reportPost } = usePost();

  // ⚙️ Garantizamos que los comentarios existan siempre
  const safeComments = post.comments ?? [];

  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-5 text-black space-y-4">
      {/* Cabecera del post */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={post.user?.avatar || '/avatars/default.jpg'}
            alt="avatar"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{post.user?.name}</p>
            <p className="text-xs text-gray-500">
              {formatDateArgentina(post.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={() => reportPost(post.id)}
          className="text-gray-400 hover:text-red-500 transition text-sm"
        >
           Reportar
        </button>
      </div>

      {/* Contenido del post */}
      {post.content && (
        <p className="text-gray-800 whitespace-pre-line bg-gray-200 rounded-xl p-3">
          {post.content}
        </p>
      )}

      {/* Multimedia */}
      {(post.mediaURL || post.mediaUrl) && (
        <div className="overflow-hidden rounded-xl border border-gray-300">
          {post.mediaType === 'video' ? (
            <video src={(post.mediaURL || post.mediaUrl) || undefined} controls className="w-full rounded-xl" />
          ) : (
            <img
              src={(post.mediaURL || post.mediaUrl) || ''}
              alt="media"
              className="w-full object-cover max-h-[400px] rounded-xl"
            />
          )}
        </div>
      )}

      {/* Likes y contador de comentarios */}
      <div className="flex items-center justify-between mt-2">
        <LikeButton likes={post.likes || 0} onLike={() => likePost(post.id)} />
        <span className="text-xs text-gray-500">
          {safeComments.length} comentarios
        </span>
      </div>

      {/* Sección de comentarios */}
      <div className="border-t border-gray-300 pt-3">
        <CommentSection comments={safeComments} postId={post.id} />
      </div>
    </div>
  );
}
