// En: /components/mensajes/PostFormCard.tsx

"use client";

import React, {useState} from "react";
// 💡 Importamos la interfaz para asegurar la consistencia de los datos

// Definimos la estructura de los datos que se enviarán al padre, omitiendo
// la información que se genera automáticamente (usuario y fecha).
interface PostFormCardData {
  titulo: string;
  mensaje: string;
  linkConectate?: string;
}

interface PostFormCardProps {
  // Esta función la llama el botón "Postear" y envía los datos al componente padre.
  onPost: (newPostData: PostFormCardData) => void;
}

const PostAviso: React.FC<PostFormCardProps> = ({onPost}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [linkConectate, setLinkConectate] = useState(""); // Campo opcional

  const handlePost = () => {
    // Validación básica
    if (title.trim() === "" || message.trim() === "") {
      alert("Por favor, ingresa un título y un mensaje.");
      return;
    }

    // 🚀 Envía los datos al componente padre
    onPost({
      titulo: title.trim(),
      mensaje: message.trim(),
      // Incluimos el link solo si el usuario escribió algo
      linkConectate: linkConectate.trim() || undefined,
    });

    // Limpiar el formulario después de postear
    setTitle("");
    setMessage("");
    setLinkConectate("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 w-full max-w-xl mx-auto mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">✍️ Crear Nuevo Anuncio</h3>

      {/* Input para el Título (corresponde a <h2 className="...">{titulo}</h2> en tu tarjeta) */}
      <input
        type="text"
        placeholder="Título del anuncio o recordatorio"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white text-sm"
      />

      {/* Textarea para el Mensaje (corresponde a <p className="...">{mensaje}</p> en tu tarjeta) */}
      <textarea
        placeholder="Escribe el mensaje o cuerpo de la publicación..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
      />

      {/* Input Opcional para el Link (corresponde a linkConectate en tu tarjeta) */}
      <input
        type="url"
        placeholder="Enlace de conexión opcional (ej: Zoom, Meet)"
        value={linkConectate}
        onChange={(e) => setLinkConectate(e.target.value)}
        className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white text-sm"
      />

      {/* Botón de Postear */}
      <div className="flex justify-end">
        <button
          onClick={handlePost}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Postear
        </button>
      </div>
    </div>
  );
};

export default PostAviso;
