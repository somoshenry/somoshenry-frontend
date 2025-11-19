"use client";
import {useState} from "react";
import {CommentType} from "@/interfaces/interfaces.post/post";
import {usePost} from "@/context/PostContext";
import {useAuth} from "@/hook/useAuth";
import {formatDateArgentina} from "@/utils/dateFormatter";
import Avatar from "@/components/ui/Avatar";
import {useRouter} from "next/navigation";
import {Flag, MessageCircle, Trash2} from "lucide-react";
import ReportModal from "@/components/common/ReportModal";

// Helpers para avatar y nombre sin bloquear dominios
function getAvatar(u: any): string {
  const candidate: string = u?.profilePicture || u?.avatar || "";
  return candidate || "/avatars/default.svg";
}

function getDisplayName(u: any): string {
  if (!u) return "Usuario";
  if (u.name && u.lastName) return `${u.name} ${u.lastName}`;
  if (u.name) return u.name;
  if (u.email) return String(u.email).split("@")[0];
  return "Usuario";
}

interface CommentProps {
  comment: CommentType;
  postId: string;
  level?: number;
  maxLevel?: number;
}

export default function Comment({comment, postId, level = 0, maxLevel = 2}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const {addComment, likeComment, deleteComment} = usePost();
  const {user} = useAuth();
  const router = useRouter();

  const isSuspended = user?.status === "SUSPENDED";
  const isAuthor = user?.id === comment.author?.id;
  const isAdmin = user?.role === "ADMIN";
  const canDelete = isAuthor || isAdmin;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) {
      alert("Tu cuenta está suspendida. No puedes comentar 🚫");
      return;
    }

    const text = replyText.trim();
    if (!text) return;

    try {
      setIsSending(true);
      await addComment(postId, text, comment.id);
      setReplyText("");
      setIsReplying(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      await deleteComment(comment.id);
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  const handleUserClick = (userId?: string) => {
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  return (
    <div style={{marginLeft: `${level * 20}px`}} className="mb-3">
      <div className="flex items-start gap-3 bg-gray-100 rounded-xl p-3 shadow-sm">
        <div className="cursor-pointer" onClick={() => handleUserClick(comment.author?.id)}>
          <Avatar
            src={getAvatar(comment.author)}
            alt={getDisplayName(comment.author)}
            width={32}
            height={32}
            className="rounded-full object-cover mt-1"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span
              className="font-semibold text-gray-800 cursor-pointer hover:text-yellow-500 transition-colors"
              onClick={() => handleUserClick(comment.author?.id)}
            >
              {getDisplayName(comment.author)}
            </span>
            <span className="text-xs text-gray-500">{formatDateArgentina(comment.createdAt)}</span>
          </div>

          <p className="text-gray-700 mt-1">{comment.content}</p>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 mt-2">
            {/* Like */}
            <button
              onClick={() => likeComment(comment.id)}
              className={`flex items-center gap-1 text-xs transition ${
                (comment as any).likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
              title={(comment as any).likedByMe ? "Quitar me gusta" : "Me gusta"}
            >
              ❤️ <span>{comment.likeCount || 0}</span>
            </button>

            {/* Responder (solo si no se alcanzó el nivel máximo) */}
            {level < maxLevel && !isSuspended && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-yellow-500 transition"
                title="Responder"
              >
                <MessageCircle size={14} />
                Responder
              </button>
            )}

            {/* Reportar */}
            <button
              onClick={() => setReportingCommentId(comment.id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition"
              title="Reportar comentario"
            >
              <Flag size={14} />
              Reportar
            </button>

            {/* Eliminar (solo autor o admin) */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition"
                title="Eliminar comentario"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            )}
          </div>

          {/* Formulario de respuesta */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-3 items-center">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                type="text"
                className="flex-1 border p-2 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#ffff00] px-3 py-2 rounded-lg text-black hover:scale-105 transition text-sm"
                disabled={isSending || !replyText.trim()}
              >
                {isSending ? "Enviando..." : "Responder"}
              </button>
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition text-sm"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal de reporte */}
      {reportingCommentId && (
        <ReportModal
          type="comment"
          targetId={reportingCommentId}
          targetTitle={comment.content.substring(0, 100)}
          onClose={() => setReportingCommentId(null)}
          onSuccess={() => setReportingCommentId(null)}
        />
      )}

      {/* Respuestas anidadas (recursivo) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} postId={postId} level={level + 1} maxLevel={maxLevel} />
          ))}
        </div>
      )}
    </div>
  );
}
