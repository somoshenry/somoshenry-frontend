"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { api } from "../services/api";
import { tokenStore } from "../services/tokenStore";
import { PostType } from "../interfaces/interfaces.post/post";
import { useAlert } from "./AlertContext";
import { useAuth } from "../hook/useAuth";

// 🔥 Beneficios del plan (BRONCE / PLATA / ORO)
import { usePlanBenefits } from "../hook/usePlanBenefits";

interface PostContextType {
  posts: PostType[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (content: string, media?: File | null) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  reportPost: (postId: string, reason: string, description?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { maxMonthlyPosts } = usePlanBenefits();
  const hasMountedRef = useRef(false);

  // ============================================================
  // 🔥 CALCULAR LIMITE MENSUAL SEGÚN PLAN
  // ============================================================
  const getMonthlyPostsCount = () => {
    const now = new Date();
    return posts.filter((p) => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  };

  const hasValidToken = (): boolean => {
    const token = tokenStore.getAccess();
    return !!token && token !== "undefined" && token !== "null";
  };

  // ============================================================
  // 🔧 NORMALIZAR UN POST
  // ============================================================

  const normalizePost = async (p: PostType) => {
    try {
      const commentsResp = await api.get(`/post/${p.id}/comments`);
      const rawComments = Array.isArray(commentsResp.data) ? commentsResp.data : [];
      const currentUserId = user?.id;

      const comments = rawComments.map((c: any) => ({
        ...c,
        likedByMe: Array.isArray(c.likes)
          ? c.likes.some((l: any) => l?.userId === currentUserId)
          : false,
      }));

      let likeCount = 0;
      try {
        const likesResp = await api.get(`/posts/${p.id}/likes`);
        likeCount = Number(likesResp.data?.likeCount ?? 0);
      } catch {
        likeCount = 0;
      }

      let mediaType: "image" | "video" | null = null;

      if (p.type === "VIDEO") mediaType = "video";
      else if (p.type === "IMAGE") mediaType = "image";
      else if (p.mediaURL || p.mediaUrl) {
        const url = p.mediaURL || p.mediaUrl || "";
        const videoExt = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
        mediaType = videoExt.some((ext) => url.toLowerCase().includes(ext))
          ? "video"
          : "image";
      }

      return {
        ...p,
        comments,
        likes: likeCount,
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaURL: p.mediaURL || p.mediaUrl || null,
        mediaType,
        likedByMe: false,
      };
    } catch {
      return {
        ...p,
        comments: [],
        likes: 0,
        mediaUrl: p.mediaURL || p.mediaUrl || null,
        mediaType: null,
      };
    }
  };

  // ============================================================
  // 📌 FETCH POSTS (carga inicial)
  // ============================================================

  const fetchPosts = useCallback(async () => {
    if (!hasValidToken()) return;

    setLoading(true);
    try {
      const { data } = await api.get("/posts");
      const list = Array.isArray(data) ? data : data.data;
      const processed = await Promise.all(list.map(normalizePost));
      setPosts(processed);
    } catch (err: any) {
      console.error("Error al cargar posts:", err);
      if (err.response?.status !== 401) showAlert("Error al cargar publicaciones ❌", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ============================================================
  // 🔄 REFRESCO SILENCIOSO
  // ============================================================

  const refreshPostsSilently = useCallback(async () => {
    if (!hasValidToken()) return;
    try {
      const { data } = await api.get("/posts");
      const list = Array.isArray(data) ? data : data.data;
      const processed = await Promise.all(list.map(normalizePost));
      setPosts(processed);
    } catch {}
  }, [user?.id]);

  // ============================================================
  // 📝 CREAR POST (con límite por plan)
  // ============================================================

  const addPost = async (content: string, media?: File | null) => {
    if (!hasValidToken()) {
      showAlert("Debes iniciar sesión para crear publicaciones.", "info");
      return;
    }

    // 🔥 Verificar límites
    const monthly = getMonthlyPostsCount();
    if (monthly >= maxMonthlyPosts) {
      const plan = user?.subscription ?? "BRONCE";
      showAlert(
        `Tu plan ${plan} permite ${maxMonthlyPosts} posteos por mes. Ya llegaste al límite.`,
        "info"
      );
      return;
    }

    try {
      const text = content?.trim() || " ";
      const type = media
        ? media.type.startsWith("video/")
          ? "VIDEO"
          : media.type.startsWith("image/")
          ? "IMAGE"
          : undefined
        : undefined;

      const payload: any = { content: text };
      if (type) payload.type = type;

      const { data: resp } = await api.post("/posts", payload);
      const post = resp?.data || resp;
      let newPost = {
        ...post,
        comments: [],
        likes: post?.likes ?? 0,
        mediaUrl: post?.mediaURL ?? null,
        mediaType: post?.mediaType ?? null,
      };

      if (media) {
        try {
          const form = new FormData();
          form.append("file", media);

          const upload = await api.put(`/files/uploadPostFile/${post.id}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          newPost = {
            ...newPost,
            mediaUrl: upload.data.mediaURL,
            mediaType: upload.data.type === "VIDEO" ? "video" : "image",
          };
        } catch {
          showAlert("El post se creó, pero no se pudo subir el archivo.", "info");
        }
      }

      setPosts((prev) => [newPost, ...prev]);
      showAlert("Publicación creada correctamente ✅", "success");
    } catch {
      showAlert("Error al crear publicación ❌", "error");
    }
  };

  // ============================================================
  // ❤️ LIKE POST
  // ============================================================

  const likePost = async (id: string) => {
    if (!hasValidToken()) return showAlert("Debes iniciar sesión.", "info");

    try {
      const { data } = await api.post(`/posts/${id}/like`);
      const count = Number(data?.likeCount ?? data?.likes ?? 0);

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: count, likedByMe: true } : p))
      );
    } catch (err: any) {
      showAlert("No se pudo actualizar el like ❌", "error");
    }
  };

  // ============================================================
  // 💬 AGREGAR COMENTARIO
  // ============================================================

  const addComment = async (postId: string, text: string, parentId?: string) => {
    if (!hasValidToken()) return showAlert("Debes iniciar sesión para comentar.", "info");

    try {
      const payload: any = { content: text };
      if (parentId) payload.parentId = parentId;

      const { data } = await api.post(`/comment/post/${postId}`, payload);
      const raw = data?.data ?? data;

      const comment = raw.author
        ? raw
        : {
            ...raw,
            author: {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              profilePicture: user?.profilePicture,
            },
          };

      const updateTree = (comments: any[]): any[] =>
        comments.map((c) => ({
          ...c,
          replies:
            c.id === parentId
              ? [...(c.replies || []), comment]
              : c.replies
              ? updateTree(c.replies)
              : [],
        }));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: parentId
                  ? updateTree(p.comments)
                  : [...p.comments, comment],
              }
            : p
        )
      );

      showAlert("Comentario agregado correctamente ✅", "success");
    } catch {
      showAlert("Error al agregar comentario ❌", "error");
    }
  };

  // ============================================================
  // 👍 LIKE COMMENT
  // ============================================================

  const likeComment = async (commentId: string) => {
    try {
      const { data } = await api.post(`/comment/${commentId}/like`);
      const removed = String(data?.message ?? "").toLowerCase().includes("removed");
      const delta = removed ? -1 : 1;

      const updateLikes = (comments: any[]): any[] =>
        comments.map((c) => ({
          ...c,
          likeCount: c.id === commentId ? Math.max(0, (c.likeCount || 0) + delta) : c.likeCount,
          likedByMe: c.id === commentId ? delta > 0 : c.likedByMe,
          replies: c.replies ? updateLikes(c.replies) : [],
        }));

      setPosts((prev) =>
        prev.map((p) => ({ ...p, comments: updateLikes(p.comments || []) }))
      );
    } catch {
      showAlert("Error al actualizar like ❌", "error");
    }
  };

  // ============================================================
  // 🗑️ ELIMINAR COMENTARIO
  // ============================================================

  const deleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comment/${commentId}`);

      const remove = (comments: any[]) =>
        comments
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? remove(c.replies) : [],
          }));

      setPosts((prev) =>
        prev.map((p) => ({ ...p, comments: remove(p.comments || []) }))
      );

      showAlert("Comentario eliminado correctamente ✅", "success");
    } catch {
      showAlert("Error al eliminar comentario ❌", "error");
    }
  };

  // ============================================================
  // 🚨 REPORTAR POST
  // ============================================================

  const reportPost = async (postId: string, reason: string, description?: string) => {
    try {
      await api.post("/reports", { postId, reason, description });
      showAlert("Reporte enviado correctamente ✅", "success");
    } catch {
      showAlert("Error al enviar reporte ❌", "error");
    }
  };

  // ============================================================
  // 🗑️ ELIMINAR POST
  // ============================================================

  const deletePost = async (postId: string) => {
    try {
      const { deletePost: doDelete } = await import("../services/postService");
      await doDelete(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showAlert("Publicación eliminada correctamente ✅", "success");
    } catch {
      showAlert("Error al eliminar publicación ❌", "error");
    }
  };

  // ============================================================
  // 🔄 USE EFFECT INICIAL
  // ============================================================

  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    fetchPosts();
    const i = setInterval(refreshPostsSilently, 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        fetchPosts,
        addPost,
        likePost,
        addComment,
        likeComment,
        reportPost,
        deletePost,
        deleteComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export const usePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePost debe usarse dentro de un PostProvider");
  return ctx;
};
