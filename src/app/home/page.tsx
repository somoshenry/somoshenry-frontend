"use client";
import {useState} from "react";
import CreatePost from "@/components/home/CreatePost";
import PostList from "@/components/home/PostList";
import {usePost} from "@/context/PostContext";
import {Users, Globe} from "lucide-react";

type TabType = "todos" | "siguiendo";

export default function HomePage() {
  const {posts, loading, fetchPosts} = usePost();
  const [activeTab, setActiveTab] = useState<TabType>("todos");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Crear nuevo post */}
        <CreatePost />

        {/* Pestañas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex">
            {/* Pestaña Todos */}
            <button
              onClick={() => setActiveTab("todos")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-all cursor-pointer ${
                activeTab === "todos"
                  ? "bg-[#ffff00] text-black "
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Globe size={20} />
              Todos
            </button>

            {/* Pestaña Siguiendo */}
            <button
              onClick={() => setActiveTab("siguiendo")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-all cursor-pointer ${
                activeTab === "siguiendo"
                  ? "bg-[#ffff00] text-black "
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users size={20} />
              Siguiendo
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Cargando publicaciones...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No hay publicaciones aún 😅</p>
        ) : (
          <PostList posts={posts} onUpdatePost={() => fetchPosts()} activeTab={activeTab} />
        )}
      </main>
    </div>
  );
}
