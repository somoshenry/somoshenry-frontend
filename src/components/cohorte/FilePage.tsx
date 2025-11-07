import FileCard, {FileCardProps} from "./FileCard";

const fileMocks: FileCardProps[] = [
  {
    name: "Guía de Inicio Rápido de React",
    description: "Documento PDF con los pasos iniciales para configurar un proyecto React.",
    uploadedAt: "2025-10-28T10:30:00Z",
    type: "doc", // PDF Documento
    url: "/files/react-quickstart-guide.pdf",
  },
  {
    name: "Informe Trimestral Q3 2025",
    description: "Detalle de métricas y resultados del tercer trimestre. Editable.",
    uploadedAt: "2025-11-01T14:45:00Z",
    type: "word", // Documento Word
    url: "/files/reporte-q3-2025.docx",
  },
  {
    name: "Introducción a TypeScript",
    description: "Video explicativo sobre los beneficios y la sintaxis básica de TypeScript.",
    uploadedAt: "2025-10-15T09:00:00Z",
    type: "video", // Archivo de Video
    url: "/videos/ts-intro.mp4",
  },
  {
    name: "Diseño de Landing Page V2",
    description: "Prototipo final en formato PNG de la nueva página de aterrizaje.",
    uploadedAt: "2025-11-05T16:20:00Z",
    type: "image", // Archivo de Imagen
    url: "/images/landing-v2-final.png",
  },
  {
    name: "Módulo de Autenticación",
    description: "Archivo con la lógica principal de manejo de sesiones y autenticación.",
    uploadedAt: "2025-11-06T11:55:00Z",
    type: "code", // Archivo de Código (ej. JS/TS)
    url: "/src/auth/auth.service.ts",
  },
  {
    name: "Recursos Gráficos del Proyecto",
    description: "Carpeta con íconos, logos y assets reutilizables.",
    uploadedAt: "2025-09-01T08:00:00Z",
    type: "folder", // Carpeta
    url: "/assets/graphics/",
  },
];

export default function FilePage() {
  return (
    <div className=" bg-gray-100 min-h-screen grow rounded-lg grid grid-cols-1 md:grid-cols-2  place-items-center">
      {fileMocks.map((post, index) => (
        <FileCard key={index} {...post} />
      ))}
    </div>
  );
}
