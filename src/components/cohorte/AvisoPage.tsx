// En: /components/cohorte/AvisoPage.tsx (CÓDIGO COMPLETO Y CORREGIDO)

import {useEffect, useState} from "react";
// Importaciones necesarias
import {getUserProfile, User} from "@/services/userService";
import ProfesorCard, {CardMensajeProps} from "./ProfesorCard";
import AvisoForm from "./AvisoForm"; // Asegúrate de que esta ruta sea correcta

// Mock inicial de avisos (para que siempre haya contenido si no hay posts nuevos)
// En: /components/cohorte/AvisoPage.tsx

const mockedPosts: CardMensajeProps[] = [
  {
    nombre: "Dr. Ana López",
    rol: "Decana de Ingeniería",
    fecha: "16:45 · 2 Nov", // 🚨 CASO 1: Prueba de imagen faltante (Mostrará las iniciales "DA")
    titulo: "Recordatorio: ¡Semana de Proyectos Finales!",
    mensaje:
      "Estimados alumnos, les recuerdo que esta semana es crucial para sus proyectos y entregas finales. Revisen el cronograma.",
  },
  {
    nombre: "Ing. Juan Pérez",
    rol: "Profesor de Sistemas",
    fecha: "10:00 · 1 Nov", // 🚨 CASO 2: Prueba de imagen existente (Mostrará esta imagen)
    picture: "https://th.bing.com/th/id/R.9365c9400cdc996af65266103d3edd47?rik=%2f%2bVmtH7YKdbqFQ&pid=ImgRaw&r=0",
    titulo: "Tutorías de Algoritmos",
    mensaje:
      "La sesión de tutoría se llevará a cabo por Google Meet. Favor de unirse puntualmente para revisar dudas del último parcial.",
    linkConectate: "https://meet.google.com/abc-xyz", // Prueba de link
  },
  {
    nombre: "Lic. María G.",
    rol: "Coordinadora Académica",
    fecha: "08:30 · 29 Oct", // 🚨 CASO 3: Prueba de mensaje largo con saltos de línea y link
    titulo: "Aviso Importante: Plazo de Becas",
    mensaje:
      "Les recordamos de la manera más atenta y urgente que el plazo límite e improrrogable para la entrega y carga de la documentación requerida para las becas finaliza el próximo viernes a las [Añadir una hora específica si la hay, por ejemplo: 23:59 horas (GMT-5)].\n\n Es fundamental que se aseguren de que todos los archivos (incluyendo formularios, comprobantes académicos, cartas de recomendación y cualquier otro requisito detallado en la convocatoria) sean subidos correctamente al portal oficial antes de que concluya esta fecha. Les instamos a no dejar este proceso para el último momento, ya que el sistema podría presentar saturación o inconvenientes técnicos de último minuto que no serán considerados como excusa válida. .",
    linkConectate: "https://portal.universidad.com/becas",
  },
  {
    nombre: "Dr. Carlos Ruiz",
    rol: "Decano de Arquitectura",
    fecha: "12:00 · 28 Oct", // 🚨 CASO 4: Prueba de imagen faltante (Mostrará las iniciales "DC")
    titulo: "Horarios de Exámenes Finales",
    mensaje:
      "Los horarios de los exámenes finales ya están disponibles en el sistema. Planifiquen sus estudios con anticipación.",
  },
];

export default function AvisoPage() {
  // 1. Estados
  const [posts, setPosts] = useState<CardMensajeProps[]>(mockedPosts);
  const [user, setUser] = useState<User | null>(null);

  // 2. 🚨 EL FETCH ESTÁ AQUÍ (DONDE DEBE ESTAR) 🚨
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

  // 3. Lógica de Rol
  const currentUserRole = user?.role;
  // isUploader es true solo si el usuario cargó Y el rol es TEACHER
  const isUploader = currentUserRole === "TEACHER";

  // 4. Función de posteo (Usa los datos del 'user' del estado)
  const handleNewPost = (formData: {titulo: string; mensaje: string; linkConectate?: string}) => {
    // Obtenemos la información del usuario logueado
    const nombrePost = `${user?.name || ""} ${user?.lastName || "Docente"}`.trim() || "Usuario Desconocido";
    const rolPost = currentUserRole === "TEACHER" ? "📚 Docente" : "Colaborador";
    const picture = user?.profilePicture || "./user.png";

    // Generar fecha y hora
    const formattedDate =
      new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " · " +
      new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });

    const newPost: CardMensajeProps = {
      ...formData,
      nombre: nombrePost,
      picture: picture,
      rol: rolPost,
      fecha: formattedDate,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <>
      {/* 1. RENDERIZADO CONDICIONAL: Solo si es TEACHER */}
      {isUploader && (
        <div className="mb-8 flex flex-col w-full ">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publicar Nuevo Aviso</h3>
          {/* El formulario llama a handleNewPost */}
          <AvisoForm onPost={handleNewPost} />
        </div>
      )}

      {/* Separador */}
      {isUploader && <hr className="my-6 border-gray-300 dark:border-gray-600" />}

      {/* 2. LISTA DE AVISOS */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No hay avisos publicados en este momento.</p>
      ) : (
        <div className="w-full">
          {posts.map((postItem, index) => (
            <ProfesorCard key={index} {...postItem} />
          ))}
        </div>
      )}
    </>
  );
}
