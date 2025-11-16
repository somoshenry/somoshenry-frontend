"use client";

import React, {useState} from "react";
import {Calendar, Timer, Video} from "lucide-react";
import Link from "next/link";

export interface CardMensajeProps {
  name: string;
  rol: string;
  picture?: string | null;
  date: string;
  time: string;
  title: string;
  description: string;
  linkConectate: string;
  datePublished: string;
  theme: "hang" | "sub";
}

const ClaseCard: React.FC<CardMensajeProps> = ({
  name,
  rol,
  date,
  title,
  time,
  datePublished,
  picture,
  description,
  linkConectate,
  theme,
}) => {
  const isHang = theme === "hang";
  const teacher = rol === "TEACHER" ? "📚 Docente" : rol === "TA" ? "👨‍💻 TA" : "";

  // Colores y textos dinámicos
  const accentColorClass = isHang ? "bg-sky-400 text-black" : "bg-green-500 text-white";
  const headerColorClass = isHang ? "text-sky-700" : "text-green-500";
  const perfilColorClass = isHang ? "bg-sky-400" : "bg-green-500";
  const lineaColorClass = isHang ? "bg-sky-400" : "bg-green-500";
  const labelText = isHang ? "Hang On" : "Sub";

  const labelColor = isHang ? "bg-sky-400 text-black" : "bg-green-500 text-white";
  // Puedes cambiar la hora y fechaClass si no vienen en el mock
  const timeDisplay = isHang ? time : "10:30 Hrs";
  const dateDisplay = isHang ? datePublished : "domingo, 25 de dic";

  const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();
  const [imgLoadError, setImgLoadError] = useState(false);
  const shouldShowInitials = !picture || imgLoadError;

  return (
    <div className="relative flex flex-col w-full mb-5 rounded-xl border border-gray-300 bg-white dark:bg-gray-200 shadow-sm p-4 overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-2 ${lineaColorClass} rounded-l-xl`}></div>

      {/* 🚀 ENCABEZADO */}
      <div className="flex justify-between items-start">
        {/* 👈 BLOQUE IZQUIERDO: Imagen y Nombre/Rol */}
        <div className="flex items-start gap-3">
          {shouldShowInitials ? (
            <div
              className={`w-12 h-12 rounded-full ${perfilColorClass} flex items-center justify-center text-black font-bold text-lg shrink-0`}
            >
              {getInitial(name)}
            </div>
          ) : (
            <img
              src={picture!}
              alt={name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              onError={() => setImgLoadError(true)}
            />
          )}

          <div>
            <h3 className="text-black font-bold text-lg leading-tight">{name}</h3>
            <p className="text-sm text-gray-700">{teacher}</p>
          </div>
        </div>

        {/* 👉 FECHA */}
        <p className="text-sm text-gray-700 whitespace-nowrap">{datePublished}</p>
      </div>

      {/* 📌 TÍTULO */}
      <h2 className={`text-lg font-extrabold ${headerColorClass} mt-2 ml-2`}>{title}</h2>
      <div className=" w-full mb-2">
        <p className={`p-1 rounded-lg mt-1 mb-1 w-fit font-bold ${labelColor}`}>{labelText}</p>
      </div>
      <div className="flex text-black items-center justify-center mb-1 w-full">
        <div className="w-[50%] flex items-center text-sm">
          <Calendar /> {date}
        </div>
        <div className="w-[50%] justify-end flex">
          <Timer /> {timeDisplay}
        </div>
      </div>

      <p className="text-sm font-semibold text-black mt-2 bg-gray-200 dark:bg-white p-2 rounded-md whitespace-pre-line wrap-break-word w-full leading-tight">
        {description}
      </p>

      {linkConectate && (
        <Link
          href={linkConectate}
          target="_blank"
          rel="noopener noreferrer"
          className={`${accentColorClass} mt-2 gap-2 w-fit flex hover:scale-105 duration-150 ease-in  text-black px-5 py-1 rounded-md font-medium `}
        >
          <Video /> Unirse
        </Link>
      )}
    </div>
  );
};

export default ClaseCard;
