"use client";

import React from "react";
import {useRouter} from "next/navigation";

export interface UserResult {
  id: string;
  name: string;
  lastName?: string | null;
  email: string;
  profilePicture?: string | null;
  role: "ADMIN" | "MEMBER" | "TEACHER" | "TA";
}

interface GenericListProps {
  data: UserResult[] | [];
  onClose: () => void;
}

const GenericList: React.FC<GenericListProps> = ({data, onClose}) => {
  const router = useRouter();

  const getDisplayName = (user: UserResult) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    return user.email.split("@")[0];
  };

  const handleUserClick = (userId: string) => {
    router.push(`/user/${userId}`);
    onClose();
  };

  return (
    <div className="absolute md:right-0 right-1 mt-2 bg-white dark:bg-gray-900 border border-gray-300 rounded-xl shadow-xl w-70 max-h-96 max-w-svh overflow-y-auto z-50">
      {data.length === 0 ? (
        <p className="p-4 text-center text-gray-500 text-sm">No hay usuarios</p>
      ) : (
        data.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b last:border-none transition-all"
          >
            {/* Foto o inicial */}
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={getDisplayName(user)}
                className="md:w-12 md:h-12 w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="md:w-12 md:h-12 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg">
                {getDisplayName(user).charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{getDisplayName(user)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                {
                  user.role === "MEMBER"
                    ? "🎓 Estudiante"
                    : user.role === "TEACHER"
                    ? "📚 Docente"
                    : user.role === "TA"
                    ? "👨‍💻 TA"
                    : user.role // Muestra el rol si es desconocido
                }
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GenericList;
