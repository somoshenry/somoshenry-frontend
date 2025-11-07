"use client";

import {useEffect, useRef, useState} from "react";
import {api} from "@/services/api";
import GenericList, {UserResult} from "@/components/ui/GenericList";
import CardMensaje, {CardMensajeProps} from "@/components/cohorte/ProfesorCard";
import FilePage from "@/components/cohorte/FilePage";

const Cohorte = () => {
  // 🔹 Mock de publicaciones
  const mockedPosts: CardMensajeProps[] = [
    {
      nombre: "Dr. Ana López",
      rol: "Decana de Ingeniería",
      fecha: "16:45 · 2 Nov",
      titulo: "Recordatorio: ¡Semana de Proyectos Finales!",
      mensaje: "Estimados alumnos, les recuerdo que esta semana es crucial para sus proyectos.",
      linkConectate: "https://plataforma.uni.edu/proyectos",
    },
    {
      nombre: "Lic. Raúl Martínez",
      rol: "Profesor de Matemáticas",
      fecha: "09:10 · 30 Oct",
      titulo: "Aviso: Cambio de horario en Tutorías",
      mensaje: "La tutoría del viernes se moverá a las 12:00 PM.",
    },
  ];

  const mockUsers: UserResult[] = [
    {
      id: "1",
      name: "Ana",
      lastName: "López",
      email: "ana.lopez@example.com",
      profilePicture: null,
      role: "STUDENT",
    },
    {
      id: "2",
      name: "Carlos",
      lastName: "Reyes",
      email: "carlos.reyes@example.com",
      profilePicture: null,
      role: "TEACHER",
    },
    {
      id: "3",
      name: "Laura",
      lastName: "Gómez",
      email: "laura.gomez@example.com",
      profilePicture: null,
      role: "STUDENT",
    },
    {
      id: "4",
      name: "Raúl",
      lastName: "Martínez",
      email: "raul.martinez@example.com",
      profilePicture: null,
      role: "ADMIN",
    },
  ];

  const [activeTab, setActiveTab] = useState("avisos");
  // const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>(mockUsers);
  const [showStudents, setShowStudents] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Obtener usuarios
  /* useEffect(() => {
    const fetchUsers = async () => {
      try {
        const {data} = await api.get(`/users`);
        console.log("🔍 Respuesta cruda del backend:", data);

        const users = data?.users || data?.data || [];
        console.log("📦 Array de usuarios procesado:", users);

        setUserResults(users);
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, []);
*/
  // 🔹 Filtrar usuarios por rol
  //const students = userResults.filter((u) => u.role === "STUDENT");
  //const teachers = userResults.filter((u) => u.role === "TEACHER");

  const students = userResults.filter((u) => u.role?.toLowerCase() === "student");
  const teachers = userResults.filter((u) => u.role?.toLowerCase() === "teacher");

  // 🔹 Cerrar desplegables si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setShowStudents(false);
        setShowTeachers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-full bg-white dark:bg-gray-900 pt-16 md:ml-64 relative">
      {/* Imagen de fondo */}
      <div className="relative w-full">
        <img src="/cohorte.png" alt="Fondo" className="w-full h-full object-cover" />

        <div className="absolute inset-0 flex pl-3">
          {/* Logo Cohorte */}
          <div
            className="size-20 md:size-48 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: "url(/logoCohorte.png)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <h4 className="md:text-5xl text-xs px-1 text-black font-extrabold">68</h4>
          </div>

          {/* Header */}
          <div className="flex flex-col w-full">
            <div className="md:mt-7 mt-1 ml-5 mr-3 flex items-center justify-between">
              <p className="md:text-2xl text-xs text-black">¡Bienvenido a tu cohorte!</p>

              {/* Botones de listas */}
              <div className="flex gap-3 relative" ref={listRef}>
                {/* Estudiantes */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-11 h-6 md:text-lg transition duration-300 cursor-pointer"
                    onClick={() => {
                      setShowStudents(!showStudents);
                      setShowTeachers(false);
                    }}
                  >
                    Estudiantes
                  </button>
                  {showStudents && <GenericList data={students} onClose={() => setShowStudents(false)} />}
                </div>

                {/* Docentes */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-11 h-6 md:text-lg transition duration-300 cursor-pointer"
                    onClick={() => {
                      setShowTeachers(!showTeachers);
                      setShowStudents(false);
                    }}
                  >
                    Docentes
                  </button>
                  {showTeachers && <GenericList data={teachers} onClose={() => setShowTeachers(false)} />}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex md:mt-12 mt-2 justify-end w-full pt-3">
              <ul className="flex w-full justify-evenly px-3 dark:text-white text-xs md:text-lg text-black pb-2">
                {["avisos", "material extra", "chat grupal"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-semibold capitalize ${
                      activeTab === tab
                        ? " px-4 rounded-lg shadow-lg dark:shadow-[#ffff00]/50 shadow-black/50 cursor-pointer dark:text-black text-md bg-[#ffff00] scale-115 transition duration-300 "
                        : "bg-gray-200 px-4 rounded-lg cursor-pointer dark:text-black text-md hover:scale-110 transition duration-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido dinámico según el tab */}
      <div className="rounded-xl md:m-5 m-2 md:pt-5 p-5 bg-gray-100 mt-6 dark:bg-gray-800 min-h-screen">
        {activeTab === "avisos" && mockedPosts.map((post, index) => <CardMensaje key={index} {...post} />)}

        {activeTab === "material extra" && <FilePage />}

        {activeTab === "chat grupal" && <div>💬 Chat del grupo</div>}
      </div>
    </div>
  );
};

export default Cohorte;
