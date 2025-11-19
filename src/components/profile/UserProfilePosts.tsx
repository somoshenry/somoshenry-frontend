"use client";
import {useEffect, useState} from "react";
import {getUserPosts, Post} from "@/services/postService";
import {api} from "@/services/api";
import {useAuth} from "@/hook/useAuth";
import VideoPlayer from "@/components/home/VideoPlayer";

interface UserProfilePostsProps {
  userId: string;
}

export default function UserProfilePosts({userId}: UserProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const {user} = useAuth();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const userPosts = await getUserPosts(userId);

        // Cargar comentarios + contador de likes de cada post
        const postsWithComments = await Promise.all(
          userPosts.map(async (post) => {
            try {
              // Cargar comentarios del post
              const commentsResponse = await api.get(`/post/${post.id}/comments`);
              const rawComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];

              // Derivar likedByMe en comentarios
              const currentUserId = user?.id;
              const comments = rawComments.map((c: any) => {
                const liked =
                  Array.isArray(c?.likes) && currentUserId
                    ? c.likes.some((l: any) => l?.userId === currentUserId)
                    : false;
                return {
                  ...c,
                  likedByMe: liked,
                  likeCount: Array.isArray(c?.likes) ? c.likes.length : 0,
                };
              });

              // Cargar cantidad de likes del post (usa el mismo endpoint que el perfil propio)
              let likeCount = 0;
              try {
                const {data: likesData} = await api.get(`/posts/${post.id}/likes`);
                likeCount = Number(likesData?.likeCount ?? 0);
              } catch {}

              return {
                ...post,
                comments,
                likeCount,
                likedByMe: false,
              };
            } catch (err) {
              console.warn(`No se pudieron cargar comentarios del post ${post.id}`, err);
              return {
                ...post,
                comments: [],
                likeCount: 0,
                likedByMe: false,
              };
            }
          })
        );

        setPosts(postsWithComments);
      } catch (err) {
        console.error("Error al cargar los posts:", err);
        setError("No se pudieron cargar las publicaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId, user?.id]);

  const getDisplayName = (u: {name?: string | null; lastName?: string | null; email: string}) => {
    if (u?.name && u?.lastName) return `${u.name} ${u.lastName}`;
    if (u?.name) return u.name;
    return u?.email?.split("@")[0] || "Usuario";
  };

  const getInitials = (u: {name?: string | null; lastName?: string | null; email: string}) => {
    const f = (u?.name || "").charAt(0);
    const l = (u?.lastName || "").charAt(0);
    const base = (f + l).trim();
    return (base || u.email.charAt(0)).toUpperCase();
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("es-ES", {dateStyle: "medium", timeStyle: "short"});

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleLike = async (postId: string) => {
    try {
      // Intentar dar like
      try {
        const {data} = await api.post(`/posts/${postId}/like`);
        let serverCount = Number(data?.likeCount ?? data?.likes ?? 0);
        if (!Number.isFinite(serverCount) || serverCount < 0) {
          try {
            const {data: c} = await api.get(`/posts/${postId}/likes`);
            serverCount = Number(c?.likeCount ?? 0);
          } catch {}
        }
        setPosts((prev) =>
          prev.map((p: any) => (p.id === postId ? {...p, likeCount: serverCount, likedByMe: true} : p))
        );
        return;
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message || "";
        const shouldTryUnlike =
          String(msg).toLowerCase().includes("ya diste like") || status === 409 || status === 400 || status === 500;
        if (shouldTryUnlike) {
          const {data} = await api.delete(`/posts/${postId}/unlike`);
          let serverCount = Number(data?.likeCount ?? 0);
          if (!Number.isFinite(serverCount) || serverCount < 0) {
            try {
              const {data: c} = await api.get(`/posts/${postId}/likes`);
              serverCount = Number(c?.likeCount ?? 0);
            } catch {}
          }
          setPosts((prev) =>
            prev.map((p: any) => (p.id === postId ? {...p, likeCount: serverCount, likedByMe: false} : p))
          );
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  const toggleLikeComment = async (commentId: string, postId: string) => {
    try {
      await api.post(`/comment/${commentId}/like`);
      // Actualizar el estado local
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments?.map((c: any) => {
                if (c.id === commentId) {
                  const wasLiked = c.likedByMe;
                  return {
                    ...c,
                    likedByMe: !wasLiked,
                    likeCount: wasLiked ? c.likeCount - 1 : c.likeCount + 1,
                  };
                }
                return c;
              }),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Error al dar like al comentario:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffff00]"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando publicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Este usuario no tiene publicaciones aún 😅</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 w-full">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md p-5 space-y-4 mx-auto"
          style={{maxWidth: "480px", width: "100%"}}
        >
          {/* Cabecera del post */}
          <div className="flex items-center gap-3">
            {post.user?.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={getDisplayName(post.user)}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#ffff00] flex items-center justify-center text-sm font-bold text-black">
                {getInitials(post.user)}
              </div>
            )}
            <div className="leading-tight">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{getDisplayName(post.user)}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>{formatDateTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Contenido del post */}
          {post.content && (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line bg-gray-200 dark:bg-gray-700 rounded-xl p-3">
              {post.content}
            </p>
          )}

          {/* Multimedia (soporta mediaURL y mediaUrl; detecta tipo por extensión) */}
          {(() => {
            const url = post.mediaURL || (post as any).mediaUrl || "";
            if (!url) return null;
            let type = post.type as any;
            if (!type || type === "TEXT") {
              const ext = url.split(".").pop()?.toLowerCase() || "";
              if (["mp4", "webm", "mov", "avi", "wmv", "mkv", "m4v"].includes(ext)) type = "VIDEO";
              else if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) type = "IMAGE";
            }
            return (
              <div className="rounded-xl flex justify-center">
                {type === "VIDEO" ? (
                  <VideoPlayer src={url} className="w-full rounded-xl max-h-96" objectFit="contain" />
                ) : (
                  <img
                    src={url}
                    alt="media"
                    className="w-auto max-w-full object-contain max-h-96 rounded-xl border border-gray-300 dark:border-gray-600"
                  />
                )}
              </div>
            );
          })()}

          {/* Likes y contador de comentarios */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                (post as any).likedByMe
                  ? "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-lg">{(post as any).likedByMe ? "❤️" : "🤍"}</span>
              <span className="text-sm font-medium">{(post as any).likeCount || 0}</span>
            </button>
            <button
              onClick={() => toggleComments(post.id)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-[#ffff00]"
            >
              {post.comments?.length || 0} comentarios
            </button>
          </div>

          {/* Sección de comentarios */}
          {expandedComments.has(post.id) && (
            <div className="border-t border-gray-300 dark:border-gray-700 pt-3 space-y-3">
              {post.comments && post.comments.length > 0 ? (
                <>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Comentarios ({post.comments.length})
                  </h4>
                  {post.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        {comment.author.profilePicture ? (
                          <img
                            src={comment.author.profilePicture}
                            alt={comment.author.name || "Usuario"}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#ffff00] flex items-center justify-center text-xs font-bold">
                            {comment.author.name?.charAt(0) || comment.author.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {comment.author.name && comment.author.lastName
                                ? `${comment.author.name} ${comment.author.lastName}`
                                : comment.author.name || comment.author.email}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                          <button
                            onClick={() => toggleLikeComment(comment.id, post.id)}
                            className={`mt-2 flex items-center gap-1 text-xs transition ${
                              comment.likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500"
                            }`}
                            aria-pressed={comment.likedByMe ? true : false}
                            title={comment.likedByMe ? "Quitar me gusta" : "Me gusta"}
                          >
                            ❤️ <span>{comment.likeCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay comentarios aún</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
