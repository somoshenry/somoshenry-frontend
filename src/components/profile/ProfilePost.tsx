"use client";
import {useEffect, useState} from "react";
import {getUserPosts, Post} from "@/services/postService";
import {getUserProfile} from "@/services/userService";
import {api} from "@/services/api";
import {useAuth} from "@/hook/useAuth";
import {useRouter} from "next/navigation";
import VideoPlayer from "@/components/home/VideoPlayer";
import Swal from "sweetalert2";

export default function ProfilePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        // Primero obtenemos el perfil del usuario para tener su ID
        const user = await getUserProfile();
        // Luego obtenemos sus posts
        const userPosts = await getUserPosts(user.id);

        // Cargar comentarios + contador de likes de cada post (similar a PostContext)
        const postsWithComments = await Promise.all(
          userPosts.map(async (post) => {
            try {
              // Cargar comentarios del post
              const commentsResponse = await api.get(`/post/${post.id}/comments`);
              const rawComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];

              // Derivar likedByMe para cada comentario
              const currentUserId = user?.id;
              const comments = rawComments.map((c: any) => {
                const liked =
                  Array.isArray(c?.likes) && currentUserId
                    ? c.likes.some((l: any) => l?.userId === currentUserId)
                    : false;
                return {...c, likedByMe: liked};
              });

              // Obtener contador de likes del post
              let likeCount = 0;
              try {
                const likesResp = await api.get(`/posts/${post.id}/likes`);
                likeCount = Number(likesResp.data?.likeCount ?? 0);
              } catch {}

              return {
                ...post,
                comments: comments,
                likeCount,
                likedByMe: false as unknown as boolean,
              };
            } catch (err) {
              // Si falla la carga de comentarios, continuar con array vacío
              console.warn(`No se pudieron cargar comentarios del post ${post.id}`, err);
              return {
                ...post,
                comments: [],
                likeCount: 0,
                likedByMe: false as unknown as boolean,
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
  }, []);

  // Helpers para mostrar datos del usuario y fecha/hora
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

  // Navegar al perfil del usuario del comentario
  const handleUserClick = (userId?: string) => {
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    // pregunta de confirmación
    const result = await Swal.fire({
      title: "¿Estás Seguro de Borrarlo?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡bórralo!",
      cancelButtonText: "No",
    });

    // 2. Si el usuario presiona "Cancelar" o cierra el diálogo, salimos
    if (!result.isConfirmed) {
      return;
    }

    try {
      const {deletePost} = await import("@/services/postService");

      await deletePost(postId);

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      Swal.fire("¡Borrado!", "La publicación ha sido eliminada exitosamente.", "success");
    } catch (err) {
      console.error("Error al intentar borrar el post:", err);

      // 5. Alerta de error
      Swal.fire("Error", "No se pudo borrar el post. Intenta de nuevo. 😥");
    }
  };

  // Toggle like en un post (manejo local similar a PostContext)
  const toggleLikePost = async (postId: string) => {
    try {
      // Intenta dar like
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
    } catch (e) {
      console.error("Error al alternar like en perfil:", e);
    }
  };

  // Toggle like en comentario (usa endpoint toggle del backend)
  const toggleLikeComment = async (commentId: string, postId: string) => {
    try {
      const {data} = await api.post(`/comment/${commentId}/like`);
      const message: string = data?.message ?? "";
      const delta =
        String(message).toLowerCase().includes("removed") || String(message).toLowerCase().includes("quit") ? -1 : 1;
      setPosts((prev) =>
        prev.map((p: any) =>
          p.id !== postId
            ? p
            : {
                ...p,
                comments: (p.comments || []).map((c: any) =>
                  c.id === commentId
                    ? {...c, likeCount: Math.max(0, (c.likeCount || 0) + delta), likedByMe: delta > 0}
                    : c
                ),
              }
        )
      );
    } catch (e) {
      console.error("Error al alternar like en comentario (perfil):", e);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-md animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-md">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-lg font-semibold">No has realizado ninguna publicación aún</p>
        <p className="text-sm mt-2">¡Comparte tu primer post!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 w-full items-center justify-center">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden mx-auto"
          style={{maxWidth: "480px", width: "100%"}}
        >
          {/* Header de la tarjeta con botón de eliminar */}
          <div className="px-6 pt-5 pb-3 flex justify-between items-start border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {post.user?.profilePicture ? (
                <img
                  src={post.user.profilePicture}
                  alt={getDisplayName(post.user)}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-black">
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
            <button
              onClick={() => handleDeletePost(post.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              title="Eliminar publicación"
            >
              🗑️
            </button>
          </div>

          {/* Contenido del post */}
          <div className="px-6 py-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Mostrar multimedia si existe (acepta mediaURL o mediaUrl, detecta tipo por extensión si es necesario) */}
            {(() => {
              // Soporte para mediaURL o mediaUrl (compatibilidad)
              const url = post.mediaURL || (post as any).mediaUrl || "";
              if (!url) return null;
              // Detectar tipo por campo o extensión
              let type = post.type;
              if (!type || type === "TEXT") {
                const ext = url.split(".").pop()?.toLowerCase() || "";
                if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) type = "IMAGE";
                if (["mp4", "webm", "mov", "avi", "wmv", "mkv", "m4v"].includes(ext)) type = "VIDEO";
              }
              if (type === "IMAGE") {
                return (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={url}
                      alt="Post media"
                      className="rounded-lg max-h-96 w-auto max-w-full object-contain border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                );
              }
              if (type === "VIDEO") {
                return (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <VideoPlayer src={url} className="w-full max-h-96" objectFit="contain" />
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Sección de interacciones - siempre visible */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6">
              {/* Botón de Me gusta (toggle + contador persistente) */}
              <button
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-2 transition-colors group ${
                  (post as any).likedByMe
                    ? "text-red-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
                aria-pressed={(post as any).likedByMe ? true : false}
                title={(post as any).likedByMe ? "Quitar me gusta" : "Me gusta"}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">❤️</span>
                <span className="text-sm font-medium">{(post as any).likeCount ?? 0}</span>
              </button>

              {/* Botón de Comentarios */}
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
                <span className="text-sm font-medium">{post.comments?.length || 0}</span>
              </button>
            </div>
          </div>

          {/* Sección de comentarios desplegable */}
          {expandedComments.has(post.id) && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Comentarios ({post.comments.length})
                  </h4>
                  {post.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="cursor-pointer" onClick={() => handleUserClick(comment.author?.id)}>
                          {comment.author.profilePicture ? (
                            <img
                              src={comment.author.profilePicture}
                              alt={comment.author.name || "Usuario"}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                              {comment.author.name?.charAt(0) || comment.author.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-yellow-500 transition-colors"
                              onClick={() => handleUserClick(comment.author?.id)}
                            >
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
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay comentarios aún</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
