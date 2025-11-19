"use client";
import {useEffect, useState} from "react";
import {X, Users, UserCheck} from "lucide-react";
import {getFollowLists, FollowUser} from "@/services/followService";
import {useRouter} from "next/navigation";

interface FollowListModalProps {
  userId: string;
  initialTab?: "followers" | "following";
  onClose: () => void;
}

export default function FollowListModal({userId, initialTab = "followers", onClose}: FollowListModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowLists();
  }, [userId]);

  const fetchFollowLists = async () => {
    try {
      setLoading(true);
      const data = await getFollowLists(userId);
      setFollowers(data.followers);
      setFollowing(data.following);
    } catch (error) {
      console.error("Error al cargar listas de seguimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (clickedUserId: string) => {
    onClose();
    router.push(`/user/${clickedUserId}`);
  };

  const getUserInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const currentList = activeTab === "followers" ? followers : following;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conexiones</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === "followers"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              Seguidores ({followers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === "following"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserCheck size={18} />
              Siguiendo ({following.length})
            </div>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                {activeTab === "followers" ? (
                  <Users size={48} className="mx-auto text-gray-400" />
                ) : (
                  <UserCheck size={48} className="mx-auto text-gray-400" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "followers" ? "Aún no tienes seguidores" : "Aún no sigues a nadie"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentList.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {getUserInitial(user.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
