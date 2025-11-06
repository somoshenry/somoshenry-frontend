'use client';
import { useState } from 'react';
import { CommentType } from '@/interfaces/interfaces.post/post';
import { usePost } from '@/context/PostContext';
import { useAuth } from '@/hook/useAuth';
import { formatDateArgentina } from '@/utils/dateFormatter';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import ReportModal from '@/components/common/ReportModal';

// Helpers para avatar y nombre sin bloquear dominios
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

export default function CommentSection({ comments, postId }: { comments?: CommentType[] | null; postId: string }) {
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const { addComment, likeComment } = usePost();
  const { user } = useAuth();
  const router = useRouter();

  // Usuario suspendido no puede comentar
  const isSuspended = user?.status === 'SUSPENDED';

  //  Aseguramos que siempre haya un array válido
  const safeComments = Array.isArray(comments) ? comments : [];

  //  Enviar nuevo comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuspended) {
      alert('Tu cuenta está suspendida. No puedes comentar 🚫');
      return;
    }

    const text = comment.trim();
    if (!text) return;
    try {
      setIsSending(true);
      await addComment(postId, text);
      setComment('');
    } finally {
      setIsSending(false);
    }
  };

  // Navegar al perfil del usuario del comentario
  const handleUserClick = (userId?: string) => {
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  return (
    <div className="border-t pt-3">
      {/* Lista de comentarios */}
      {safeComments.length === 0 ? (
        <p className="text-gray-500 text-sm">Sé el primero en comentar 💬</p>
      ) : (
        <ul className="space-y-3 text-sm text-gray-700">
          {safeComments.map((c) => (
            <li key={c.id} className="flex items-start gap-3 bg-gray-100 rounded-xl p-3 shadow-sm">
              <div className="cursor-pointer" onClick={() => handleUserClick(c.author?.id)}>
                <Avatar src={getAvatar(c.author)} alt={getDisplayName(c.author)} width={32} height={32} className="rounded-full object-cover mt-1" />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => handleUserClick(c.author?.id)}>
                    {getDisplayName(c.author)}
                  </span>
                  <span className="text-xs text-gray-500">{formatDateArgentina(c.createdAt)}</span>
                </div>

                <p className="text-gray-700 mt-1">{c.content}</p>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Like discreto con estado visual */}
                  <button onClick={() => likeComment(c.id)} className={`flex items-center gap-1 text-xs transition ${(c as any).likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`} aria-pressed={(c as any).likedByMe ? true : false} title={(c as any).likedByMe ? 'Quitar me gusta' : 'Me gusta'}>
                    ❤️ <span>{c.likeCount || 0}</span>
                  </button>

                  {/* Botón de reportar */}
                  <button onClick={() => setReportingCommentId(c.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition" title="Reportar comentario">
                    <Flag size={14} />
                    Reportar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de reporte */}
      {reportingCommentId && <ReportModal type="comment" targetId={reportingCommentId} targetTitle={safeComments.find((c) => c.id === reportingCommentId)?.content.substring(0, 100)} onClose={() => setReportingCommentId(null)} onSuccess={() => setReportingCommentId(null)} />}

      {/* Formulario de nuevo comentario */}
      {isSuspended ? (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
          <span className="text-sm text-red-700 dark:text-red-400">🚫 Tu cuenta está suspendida. No puedes comentar.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 items-center">
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario..." type="text" className="flex-1 border p-2 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-300" />
          <button type="submit" className="bg-[#ffff00] px-3 py-2 rounded-lg text-black hover:bg-yellow-300 transition" disabled={isSending || !comment.trim()}>
            {isSending ? 'Enviando...' : 'Comentar'}
          </button>
        </form>
      )}
    </div>
  );
}
