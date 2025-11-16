import {useEffect, useState} from "react";
import ClaseCard, {CardMensajeProps} from "./ClaseCard";
import ClassProgramar, {cardDataProps, UserInfo} from "./ClassProgramar";
import {getUserProfile, User} from "@/services/userService";

interface ClaseHangProps {
  theme: "hang" | "sub";
}

type PublishedCard = CardMensajeProps;

const ClaseHang: React.FC<ClaseHangProps> = ({theme}) => {
  const mockMensajes: CardMensajeProps[] = [
    {
      name: "Dr. Elena Rojas",
      rol: "TEACHER",
      picture: "https://ejemplo.com/avatar/elena.jpg",
      date: "Lunes, 18 de Dic",
      time: "10:30 Hrs",
      title: "Lecture 1: Introducción a la Arquitectura Web",
      datePublished: "sábado, 12 de nov",
      description:
        "Revisaremos la lectura obligatoria sobre los modelos cliente-servidor, el ciclo de vida de una solicitud HTTP y las capas básicas del desarrollo Full Stack.",
      linkConectate: "https://meet.google.com/abc-defg-hij",
      theme: "sub", // Manteniendo el tema original de este mock
    },
    {
      name: "Javier Solís",
      rol: "TEACHER",
      picture: null,
      date: "Miércoles, 20 de Dic",
      time: "04:00 PM",
      title: "Lecture 2: Patrones de Diseño Backend (MVC)",
      datePublished: "domingo, 13 de nov",
      description:
        "Clase de discusión sobre la lectura enfocada en el patrón MVC (Modelo-Vista-Controlador). Analizaremos su implementación en frameworks populares.",
      linkConectate: "https://zoom.us/j/1234567890",
      theme: "hang", // Asumiendo que quieres que este sea un ejemplo de 'hang'
    },
    {
      name: "Laura Gómez",
      rol: "TEACHER",
      picture: "https://ejemplo.com/avatar/laura.jpg",
      date: "Viernes, 22 de Dic",
      time: "09:00 AM",
      title: "Lecture 3: Manejo de Estado en el Frontend",
      datePublished: "lunes, 14 de nov",
      description:
        "Revisaremos la lectura sobre las diferentes estrategias de manejo de estado en SPA (React/Vue/Angular), desde el estado local hasta Redux/Zustand.",
      linkConectate: "https://teams.microsoft.com/r/s/1a2b3c4d",
      theme: "hang", // Asumiendo que quieres que este sea un ejemplo de 'hang'
    },
    {
      name: "Miguel Torres",
      rol: "TEACHER",
      picture: "https://ejemplo.com/avatar/miguel.jpg",
      date: "Jueves, 21 de Dic",
      time: "03:00 PM",
      title: "Lecture 4: Seguridad y Autenticación con JWT",
      datePublished: "martes, 15 de nov",
      description:
        "Discusión sobre la lectura de seguridad. Nos centraremos en la autenticación, la autorización y el uso de JSON Web Tokens (JWT) en aplicaciones Full Stack.",
      linkConectate: "https://meet.google.com/sesion-ayuda-dev",
      theme: "sub", // Manteniendo el tema original de este mock
    },
  ];

  const [user, setUser] = useState<User | null>(null);
  const [publishedCards, setPublishedCards] = useState<PublishedCard[]>([]);

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

  const isUploader = user?.role === "TEACHER";
  const currentUserInfo: UserInfo | null = user
    ? {loggedName: user.name || "Desconocido", loggedRol: user.role || "Desconocido"}
    : null;

  const formatFullDate = (isoDate: string): string => {
    if (!isoDate) return "";
    try {
      const dateObj = new Date(isoDate + "T00:00:00");

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "short",
        day: "numeric",
      };

      let formatted = new Intl.DateTimeFormat("es-ES", options).format(dateObj);
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

      return formatted;
    } catch (e) {
      console.error("Error al formatear fecha completa:", e);
      return isoDate; // Devolver el formato original si falla
    }
  };

  const handleDataUpdate = (data: cardDataProps & UserInfo) => {
    const now = new Date();
    const datePublishedString = now
      .toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(".", "");

    const formattedEventDate = formatFullDate(data.date);
    const newCard: PublishedCard = {
      name: data.loggedName,
      rol: data.loggedRol,
      ...data,
      date: formattedEventDate,
      linkConectate: data.linkclace,
      datePublished: datePublishedString,

      picture: user?.profilePicture || undefined,
    };
    setPublishedCards((prevCards) => [newCard, ...prevCards]);
  };

  return (
    <>
      <div className="bg-linear-to-r to-blue-500 from-[#ffff00] rounded-lg p-3 text-black border-0">
        <div className="pt-1">
          <h2 className="mb-2 font font-extrabold">Mis clases</h2>
          <p className="font-medium">Accede a todas tus sesiones y clases programadas</p>
        </div>
      </div>

      <div className=" md:flex md:flex-row flex flex-col items-center md:items-start">
        {isUploader && currentUserInfo && (
          <ClassProgramar onDataUpdate={handleDataUpdate} sectionTheme={theme} currentUser={currentUserInfo} />
        )}
        <div className=" ml-3 p-3 w-full">
          {publishedCards.map((card, index) => (
            <ClaseCard key={`pub-${index}`} {...card} theme={theme} />
          ))}
          {mockMensajes.map((post, index) => (
            <ClaseCard key={`mock-${index}`} {...post} theme={theme} />
          ))}
        </div>
      </div>
    </>
  );
};
export default ClaseHang;
