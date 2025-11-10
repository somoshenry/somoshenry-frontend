"use client";

import IFileCardProps from "@/interfaces/cohorte/IFileCardProps";
import React, {useEffect, useState} from "react";
import {mapMimeToCategory} from "@/utils/file-mappers";
import {getUserProfile, User} from "@/services/userService";
import Link from "next/link";

const FileCard: React.FC<IFileCardProps> = ({name, description, uploadedAt, type, url}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      }
    };

    fetchUserProfile();
  }, []);

  // datos del que subio archivo

  const firstName = user?.name || "Colaborador";

  const lastName = user?.lastName || "";
  const roleCode = user?.role;
  let role = roleCode ? (roleCode === "TEACHER" ? "📚 Docente" : roleCode) : "Rol no disponible";
  if (role === "MEMBER") {
    role = "📚 Docente"; // <-- Uso de 'role =' para asignar
  }

  const getFileIcon = () => {
    // 💡 Corregido: Usar el nombre de la función correcta
    const fileCategory = mapMimeToCategory(type);

    switch (fileCategory) {
      case "doc":
        return <img src="./doc.png" className="size-20" alt="Documento" />;
      case "video":
        return <img src="./movie.png" className="size-20" alt="Video" />;
      case "image":
        return <img src="./img.png" className="size-20" alt="Imagen" />;
      case "code":
        return <img src="./code.png" className="size-20" alt="Código" />;
      case "folder":
        return <img src="./folder.png" className="size-20" alt="Carpeta" />;
      default:
        return <img src="./default.png" className="size-20" alt="Archivo" />;
    }
  };

  return (
    <div className="flex items-center bg-white border mb-3 mt-3 md:mb-0 dark:bg-gray-200  border-gray-200 rounded-xl shadow-sm p-4 w-[96%] hover:shadow-md hover:shadow-black transition-shadow duration-300 m-3">
      {/* Ícono del archivo */}
      <div className="mr-3 shrink-0">{getFileIcon()}</div>

      {/* Información */}
      <div className="flex flex-col w-[60%] md:w-[80%] text-black justify-center">
        <p className="font-bold text-sky-700 text-md ">{name}</p>
        <p className=" text-xs mb-2">{description}</p>
        <p className=" text-xs">Subido: {uploadedAt}</p>
        <p className="text-xs">
          Por: {firstName} {lastName}
        </p>
        <p className="text-xs mb-2"> {role}</p>

        {/* Botón */}
        <div className="flex items-center justify-end">
          <Link
            // 💡 CLAVE: Esto usa la URL del archivo
            href={url}
            // 💡 Esto abre el archivo en una pestaña nueva para verlo o descargarlo
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ffff00] text-black  hover:scale-105 dark:bg-gray-800 dark:text-white text-xs font-medium py-1.5 px-3 rounded-md  duration-300"
          >
            Ver Archivo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
