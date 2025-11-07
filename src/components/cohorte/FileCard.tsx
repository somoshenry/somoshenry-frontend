"use client";

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
    <div className="flex items-center bg-white border mb-3 mt-3 md:mb-0  border-gray-200 rounded-xl shadow-sm p-4 w-[350px] hover:shadow-md hover:shadow-black transition-shadow duration-300">
      {/* Ícono del archivo */}
      <div className="mr-3 shrink-0">{getFileIcon()}</div>

      {/* Información */}
      <div className="flex flex-col grow">
        <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
        <p className="text-gray-500 text-xs mb-1">{description}</p>
        <p className="text-gray-400 text-xs mb-2">Subido: {uploadedAt}</p>

        {/* Botón */}
        <div className="flex items-center justify-end">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-300"
          >
            Ver Archivo
          </a>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
