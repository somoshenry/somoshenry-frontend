// En: /components/cohorte/AvisoForm.tsx

"use client";

import React, {useState} from "react";
// La interfaz CardMensajeProps debe venir de ProfesorCard (ProfesorCard.tsx)
import ImputGeneric from "../login/register/ImputGeneric";
import Swal from "sweetalert2";

// Estructura de datos que recolecta el formulario
interface AvisoFormData {
  titulo: string;
  mensaje: string;
  linkConectate?: string;
}

interface AvisoFormProps {
  // La función que recibirá los datos y los añadirá a la lista de posts en AvisoPage
  onPost: (newPostData: AvisoFormData) => void;
}

const AvisoForm: React.FC<AvisoFormProps> = ({onPost}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [linkConectate, setLinkConectate] = useState("");

  const handlePost = () => {
    if (title.trim() === "" || message.trim() === "") {
      Swal.fire({
        icon: "warning", // O 'error', si lo prefieres
        title: "Campos Incompletos",
        text: "Por favor, ingresa un título y un mensaje.",
        confirmButtonText: "Entendido",
        // Opcional: para que se cierre al hacer clic fuera
        allowOutsideClick: true,
      });
      return;
    }

    onPost({
      titulo: title.trim(),
      mensaje: message.trim(),
      linkConectate: linkConectate.trim() || undefined,
    });

    // Limpiar el formulario
    setTitle("");
    setMessage("");
    setLinkConectate("");
  };

  return (
    <div className="bg-white dark:bg-gray-200 p-5 rounded-xl shadow-lg border border-gray-200 w-full ">
      <h3 className="text-xl font-bold text-gray-900 mb-4">📣 Publicar Nuevo Aviso</h3>

      <ImputGeneric id="title" label="Titulo" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

      <div className="my-2">
        <label htmlFor="message" className="font-text text-black text-lg">
          Mensaje del Aviso
        </label>
        <textarea
          id="message" // Debe coincidir con htmlFor
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1} // Aumentado a 4 filas para mejor visibilidad
          // Estilos que tenías, con ajuste de 'resize' a 'none'
          className="bg-gray-100 w-full rounded-lg px-3 py-2 text-black pr-12 text-lg focus:outline-[#ffff00] focus:duration-150 ease-in"
        />
      </div>

      <ImputGeneric
        id="url"
        label="url"
        type="url"
        placeholder="opcional..."
        value={linkConectate}
        onChange={(e) => setLinkConectate(e.target.value)}
        className="w-full mb-2 p-3 border border-gray-300 rounded-lg focus:ring-sky-700 focus:border-sky-700 bg-gray-100 text-black text-sm"
      />

      <div className="md:flex md:justify-end flex justify-center mt-3">
        <button
          onClick={handlePost}
          className="bg-[#ffff00] hover:scale-105 cursor-pointer duration-150 ease-in text-black dark:bg-gray-800 dark:text-white font-semibold py-2 px-6 rounded-lg "
        >
          Postear Aviso
        </button>
      </div>
    </div>
  );
};

export default AvisoForm;
