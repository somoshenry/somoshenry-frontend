"use client";
import React from "react";
import {Heart} from "lucide-react";
import Link from "next/link";

export interface CardMensajeProps {
  nombre: string;
  rol: string;
  fecha: string;
  titulo: string;
  mensaje: string;
  linkConectate?: string; // 🔹 puede o no existir
}

const CardMensaje: React.FC<CardMensajeProps> = ({nombre, rol, fecha, titulo, mensaje, linkConectate}) => {
  return (
    <div className="relative flex flex-col w-full md:mt-2 mt-3 mb-5 rounded-xl border border-gray-300 bg-white dark:bg-gray-200 dark: shadow-sm p-4 overflow-hidden">
      {/* Borde lateral rosado */}
      <div className="absolute left-0 top-0 h-full w-2 bg-[#ffff00] rounded-l-xl"></div>

      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img
            src="/user.png" // 🔁 reemplaza por la imagen real
            alt={nombre}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-black font-bold text-lg leading-tight">{nombre}</h3>
            <p className="text-sm text-gray-700">{rol}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">{fecha}</p>
      </div>

      {/* Título */}
      <h2 className="text-lg font-extrabold text-sky-700 mt-1">{titulo}</h2>

      {/* Mensaje */}
      <p className="text-sm font-semibold text-black mt-1 bg-gray-200 p-2 rounded-md">{mensaje}</p>

      {/* Botones */}
      <div className="flex items-center justify-between gap-4 mt-3">
        <div className="flex items-center text-gray-600 cursor-pointer hover:text-rose-500 transition">
          <Heart fill="red" stroke="red" size={20} className="mr-1" />
          <span className="font-medium">Me gusta</span>
        </div>
        {linkConectate && (
          <Link
            href={linkConectate}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-300 text-gray-700 px-5 py-1 rounded-md font-medium hover:bg-gray-400 transition"
          >
            Conéctate
          </Link>
        )}
      </div>
    </div>
  );
};

export default CardMensaje;
