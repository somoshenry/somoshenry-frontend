// En: /components/cohorte/FilePage.tsx

import IFileCardProps from "@/interfaces/cohorte/IFileCardProps";
import {useEffect, useState} from "react";
import FileCard from "./FileCard";
import FilePageReal from "./FilePageReal"; // El componente de subida
import {getUserProfile, User} from "@/services/userService";

// Mock inicial de archivos
const fileMocks: IFileCardProps[] = [
  {
    name: "Guía de Inicio Rápido de React",
    description: "Documento PDF para configurar un proyecto React.",
    uploadedAt: "28/10/2025", // Fecha amigable (DD/MM/AAAA)
    type: "application/pdf",
    url: "https://ejemplos.com/files/react-quickstart-guide.pdf", // URL que intentará abrirse en línea (PDF)
  },
  {
    name: "Informe Trimestral Q3 2025",
    description: "Detalle de métricas y resultados del tercer trimestre. Editable.",
    uploadedAt: "01/11/2025", // Fecha amigable
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    url: "https://ejemplos.com/files/reporte-q3-2025.docx", // URL que generalmente forzará descarga (DOCX)
  },
  {
    name: "Introducción a TypeScript",
    description: "Video explicativo.",
    uploadedAt: "15/10/2025", // Fecha amigable
    type: "video/mp4",
    url: "https://ejemplos.com/videos/ts-intro.mp4", // URL que intentará abrirse en línea (Video)
  },
  {
    name: "Diseño de Landing Page V2",
    description: "Prototipo final en formato PNG.",
    uploadedAt: "05/11/2025", // Fecha amigable
    type: "image/png",
    url: "https://ejemplos.com/images/landing-v2-final.png", // URL que intentará abrirse en línea (Imagen)
  },
  {
    name: "Módulo de Autenticación",
    description: "Lógica de sesiones.",
    uploadedAt: "06/11/2025", // Fecha amigable
    type: "text/typescript",
    url: "https://ejemplos.com/src/auth/auth.service.ts", // URL que podría forzar descarga o mostrar texto plano
  },
  {
    name: "Documento PDF de Prueba",
    description: "Ejemplo de PDF público para verificación del visor.",
    uploadedAt: "28/10/2025",
    type: "application/pdf", // 💡 Usa un enlace de PDF real y público para la prueba
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    name: "Imagen de Prueba",
    description: "Ejemplo de JPG para verificar el visor.",
    uploadedAt: "05/11/2025",
    type: "image/png", // 💡 Usa un enlace de imagen real y pública para la prueba
    url: "https://picsum.photos/800/600",
  },
  {
    name: "Recursos Gráficos del Proyecto",
    description: "Carpeta con íconos.",
    uploadedAt: "01/09/2025", // Fecha amigable
    type: "folder",
    url: "https://ejemplos.com/assets/graphics/", // URL que simula una carpeta o descarga de un ZIP
  },
];

export default function FilePage() {
  // 1. Estado central para la lista de archivos (inicialmente con los mocks)
  const [filesList, setFilesList] = useState<IFileCardProps[]>(fileMocks);
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

  // 2. Lógica de Rol (Simulación)
  const currentUserRole = user?.role; // <-- Cambiar para probar
  const isUploader = currentUserRole === "TEACHER";

  return (
    <>
      {/* 3. Renderizado Condicional del Uploader */}
      {isUploader && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Subir Nuevo Material</h3>
          <FilePageReal setFilesList={setFilesList} />
        </div>
      )}
      {/* Separador visual si se mostró el uploader */}
      {isUploader && <hr className="my-6 border-gray-300 dark:border-gray-600" />}
      {/* 4. Mapeo de la Lista COMPLETA (con los estilos que pediste) */}
      {/* Este es el bloque con los estilos originales: min-h-screen grow grid grid-cols-1 md:grid-cols-2 place-items-center */}
      <div className="min-h-screen grow rounded-lg grid grid-cols-1 md:grid-cols-2 place-items-center">
        {filesList.map((file, index) => (
          <FileCard key={index} {...file} />
        ))}
      </div>
    </>
  );
}
