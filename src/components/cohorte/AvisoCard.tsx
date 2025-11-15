"use client";

import React, {useState} from "react";
import {Heart} from "lucide-react";
import Link from "next/link";

export interface CardMensajeProps {
  nombre: string;
  rol: string;
  picture?: string;
  fecha: string;
  titulo: string;
  mensaje: string;
  linkConectate?: string;
}

// Suponemos que el número inicial de likes podría venir de una prop,
// pero para este ejemplo, lo inicializaremos en 0.
const INITIAL_LIKES = 0;

const AvisoCard: React.FC<CardMensajeProps> = ({nombre, rol, fecha, titulo, picture, mensaje, linkConectate}) => {
  const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();

  const [imgLoadError, setImgLoadError] = useState(false);
  const shouldShowInitials = !picture || imgLoadError;

  // 🆕 ESTADOS PARA EL CONTADOR DE ME GUSTA
  const [likeCount, setLikeCount] = useState(INITIAL_LIKES);
  const [isLiked, setIsLiked] = useState(false);

  // 🆕 FUNCIÓN PARA MANEJAR EL CLIC
  const handleLikeClick = () => {
    if (isLiked) {
      // Si ya tiene "Me gusta", lo quitamos
      setLikeCount(likeCount - 1);
      setIsLiked(false);
    } else {
      // Si no tiene "Me gusta", lo añadimos
      setLikeCount(likeCount + 1);
      setIsLiked(true);
    }
  };

  // 🎨 Definición de estilos dinámicos para el ícono
  const heartIconClass = isLiked
    ? "text-red-500 fill-red-500" // Rojo al dar like
    : "text-gray-400 fill-gray-400"; // Gris por defecto

  // 🎨 Definición de estilos dinámicos para el texto
  const textCountClass = isLiked
    ? "text-red-500 font-bold" // Texto en rojo y negrita al dar like
    : "text-black font-medium"; // Texto en gris por defecto

  return (
    <div className="relative flex flex-col w-full md:mt-2 mt-3 mb-5 rounded-xl border border-gray-300 bg-white dark:bg-gray-200 shadow-sm p-4 overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-2 bg-[#ffff00] rounded-l-xl"></div>

      {/* 🚀 ENCABEZADO */}
      <div className="flex justify-between items-start">
        {/* 👈 BLOQUE IZQUIERDO: Imagen y Nombre/Rol */}
        <div className="flex items-start gap-3">
          {shouldShowInitials ? (
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg shrink-0">
              {getInitial(nombre)}
            </div>
          ) : (
            <img
              src={picture!}
              alt={nombre}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              onError={() => setImgLoadError(true)}
            />
          )}

          <div>
            <h3 className="text-black font-bold text-lg leading-tight">{nombre}</h3>
            <p className="text-sm text-gray-700">{rol}</p>
          </div>
        </div>

        {/* 👉 FECHA */}
        <p className="text-sm text-gray-700 whitespace-nowrap">{fecha}</p>
      </div>

      {/* 📌 TÍTULO */}
      <h2 className="text-lg font-extrabold text-sky-700 mt-2 ml-2">{titulo}</h2>

      <p className="text-sm font-semibold text-black mt-2 bg-gray-200 dark:bg-white p-2 rounded-md whitespace-pre-line wrap-break-word w-full leading-tight">
        {mensaje}
      </p>

      {/* ❤️ BOTONES Y LIKES */}
      <div className="flex items-center justify-between gap-4 mt-3">
        {/* 🆕 CONTADOR Y BOTÓN DE ME GUSTA */}
        <button
          onClick={handleLikeClick}
          className="flex items-center gap-1 transition duration-200 ease-in-out cursor-pointer hover:scale-[1.01]"
        >
          <Heart
            size={20}
            // 🎨 ICONO DINÁMICO
            className={`${heartIconClass} mr-1 transition duration-200`}
            // Usamos 'currentColor' para que el stroke tome el color de 'heartIconClass'
            stroke={isLiked ? "red" : "gray"}
            fill={isLiked ? "currentColor" : "none"}
          />
          <span
            // 🎨 TEXTO DINÁMICO
            className={`${textCountClass} transition duration-200`}
          >
            {likeCount} Me gusta
          </span>
        </button>

        {linkConectate && (
          <Link
            href={linkConectate}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ffff00] dark:bg-gray-800 hover:scale-105 duration-150 ease-in dark:text-white text-black px-5 py-1 rounded-md font-medium "
          >
            Conéctate
          </Link>
        )}
      </div>
    </div>
  );
};

export default AvisoCard;
