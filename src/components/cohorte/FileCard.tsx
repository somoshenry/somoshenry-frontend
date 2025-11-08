"use client";

import Link from "next/link";
import React from "react";

export interface FileCardProps {
  name: string;
  description: string;
  uploadedAt: string;
  type: string; // "doc", "word", "video", "image", code, folder, etc.
  url: string;
}

const FileCard: React.FC<FileCardProps> = ({name, description, uploadedAt, type, url}) => {
  // 🔍 Cambia el icono según el tipo de archivo
  const getFileIcon = () => {
    switch (type.toLowerCase()) {
      case "doc":
        return <img src="./doc.png" className="size-20" />;
      case "video":
        return <img src="./movie.png" className="size-20" />;
      case "image":
        return <img src="./img.png" className="size-20" />;
      case "code":
        return <img src="./code.png" className="size-20" />;
      case "folder":
        return <img src="./folder.png" className="size-20" />;
      default:
        return <img src="./default.png" className="size-20" />;
    }
  };

  return (
    <div className="flex items-center bg-white border mb-3 mt-3 md:mb-0 dark:bg-gray-200  border-gray-200 rounded-xl shadow-sm p-4 w-[380px] hover:shadow-md hover:shadow-black transition-shadow duration-300">
      {/* Ícono del archivo */}
      <div className="mr-3 shrink-0">{getFileIcon()}</div>

      {/* Información */}
      <div className="flex flex-col text-black justify-center">
        <p className="font-bold text-sky-700 text-md truncate">{name}</p>
        <p className=" text-xs mb-1">{description}</p>
        <p className=" text-xs mb-2">Subido: {uploadedAt}</p>

        {/* Botón */}
        <div className="flex items-center justify-end">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-300"
          >
            Ver Archivo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
