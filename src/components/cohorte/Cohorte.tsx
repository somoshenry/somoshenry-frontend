'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import GenericList, { UserResult } from '@/components/ui/GenericList';
import FilePage from '@/components/cohorte/FilePage';
import Lecture, { lectureProp } from '@/components/cohorte/Lecture';
import ChatGrupal from '@/components/cohorte/ChatGrupal';
import { useSearchParams } from 'next/navigation';
import AvisoPage from './AvisoPage';
import Clases from './Clases';
import { useAuth } from '@/hook/useAuth';

// MOCKS COMENTADOS PARA REFERENCIA
// import FilePageMock from '@/components/cohorte/FilePageMock';
// import ChatGrupalMock from '@/components/cohorte/ChatGrupalMock';
// import AvisoPageMock from './AvisoPageMock';
// import ClasesMock from './ClasesMock';

export const Cohorte = () => {
  const { user } = useAuth();
  const mockUsers: UserResult[] = [
    {
      id: '1',
      name: 'Ana',
      lastName: 'López',
      email: 'ana.lopez@example.com',
      profilePicture: null,
      role: 'MEMBER',
    },
    {
      id: '2',
      name: 'Carlos',
      lastName: 'Reyes',
      email: 'carlos.reyes@example.com',
      profilePicture: null,
      role: 'TEACHER',
    },
    {
      id: '3',
      name: 'Laura',
      lastName: 'Gómez',
      email: 'laura.gomez@example.com',
      profilePicture: null,
      role: 'MEMBER',
    },
    {
      id: '4',
      name: 'Raúl',
      lastName: 'Martínez',
      email: 'raul.martinez@example.com',
      profilePicture: null,
      role: 'ADMIN',
    },
    // --- Nuevo Mock con Rol TA (Teaching Assistant) ---
    {
      id: '5',
      name: 'Sofía',
      lastName: 'Herrera',
      email: 'sofia.herrera@example.com',
      profilePicture: 'https://example.com/images/sofia_ta.jpg', // Ejemplo con imagen
      role: 'TA', // Rol de Asistente de Enseñanza
    },
    // --- Otro Estudiante ---
    {
      id: '6',
      name: 'Javier',
      lastName: 'Castro',
      email: 'javier.castro@example.com',
      profilePicture: null,
      role: 'TA',
    },
  ];

  const mockLectures: lectureProp[] = [
    {
      lecture: 'L01',
      title: 'Introducción a la Programación',
      description: 'Conceptos básicos y fundamentos de la lógica de programación.',
    },
    {
      lecture: 'L02',
      title: 'Estructuras de Control',
      description: 'Uso de condicionales (if/else) y bucles (for, while) en código.',
    },
    {
      lecture: 'L03',
      title: 'Programación Orientada a Objetos',
      description: 'Exploración de clases, objetos, herencia y polimorfismo.',
    },
    {
      lecture: 'L04',
      title: 'Gestión de Datos y Arrays',
      description: 'Cómo almacenar y manipular colecciones de datos utilizando arrays y listas.',
    },
    {
      lecture: 'L05',
      title: 'Desarrollo Web con React',
      description: 'Primeros pasos para construir interfaces de usuario con la biblioteca React.',
    },
  ];

  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'avisos');
  const [userResults, setUserResults] = useState<UserResult[]>(mockUsers);
  const [showStudents, setShowStudents] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);
  const [showTA, setShowTA] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Obtener usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get(`/users`);
        console.log('🔍 Respuesta cruda del backend:', data);

        const users = data?.users || data?.data || [];
        console.log('📦 Array de usuarios procesado:', users);

        setUserResults(users);
      } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Filtrar usuarios por rol
  const students = userResults.filter((u) => u.role === 'MEMBER');
  const teachers = userResults.filter((u) => u.role === 'TEACHER');
  const tasistand = userResults.filter((user) => user.role === 'TA');

  // 🔹 Cerrar desplegables si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setShowStudents(false);
        setShowTeachers(false);
        setShowTA(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-white dark:bg-gray-900 pt-16 md:ml-64 relative">
      {/* Imagen de fondo */}
      <div className="relative w-full">
        <img src="/cohorte.png" alt="Fondo" className="w-full h-full object-cover" />

        <div className="absolute inset-0 flex ">
          {/* Logo Cohorte */}
          <div
            className="w-[17%] flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: 'url(/logoCohorte.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            <h4 className="md:text-xl text-sm lg:text-5xl px-1 text-black font-extrabold">68</h4>
          </div>

          {/* Header */}
          <div className="flex flex-col w-[83%]">
            <div className=" flex items-center justify-between px-2">
              <p className="text-xs/3 mt-0.5  md:text-xl/4 lg:text-2xl xl:text-3xl text-black">¡Bienvenido a tu cohorte!</p>

              {/* Botones de listas */}
              <div className="flex gap-1 relative" ref={listRef}>
                {/* Estudiantes */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-7 md:mt-2 h-6 md:text-xs lg:h-8 lg:text-md lg:px-3 lg:py-0 transition duration-300 cursor-pointer lg:mt-4 xl:text-xl xl:px-4 xl:py-2 xl:h-12"
                    onClick={() => {
                      setShowStudents(!showStudents);
                      setShowTeachers(false);
                      setShowTA(false);
                    }}
                  >
                    Estudiantes
                  </button>
                  {showStudents && <GenericList data={students} onClose={() => setShowStudents(false)} />}
                </div>

                {/* Docentes */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-7 md:mt-2 h-6 md:text-xs lg:h-8 lg:text-md lg:px-3 lg:py-0 transition duration-300 cursor-pointer lg:mt-4 xl:text-xl xl:px-4 xl:py-2 xl:h-12"
                    onClick={() => {
                      setShowTeachers(!showTeachers);
                      setShowStudents(false);
                      setShowTA(false);
                    }}
                  >
                    Docentes
                  </button>
                  {showTeachers && <GenericList data={teachers} onClose={() => setShowTeachers(false)} />}
                </div>

                {/* Docentes */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-7 md:mt-2 h-6 md:text-xs lg:h-8 lg:text-md lg:px-3 lg:py-0 transition duration-300 cursor-pointer lg:mt-4 xl:text-xl xl:px-4 xl:py-2 xl:h-12"
                    onClick={() => {
                      setShowTA(!showTA);
                      setShowTeachers(false);
                      setShowStudents(false);
                    }}
                  >
                    TA
                  </button>
                  {showTA && <GenericList data={tasistand} onClose={() => setShowTA(false)} />}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex  justify-end w-full mt-[8%]">
              <div className="flex w-full px-1 justify-evenly dark:text-white text-xs md:text-md text-black pb-2 lg:text-xl md:text-lg xl:text-lg">
                {['avisos', 'Lecturas', 'Clases', 'material extra', 'chat grupal'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-semibold capitalize ${activeTab === tab ? ' rounded-lg  px-1 shadow-lg dark:shadow-[#ffff00]/50 shadow-black/50 cursor-pointer dark:text-black  text-md  bg-[#ffff00] transition duration-300 ' : 'bg-gray-200 px-1 rounded-lg md:text-lg lg:text-xl xl:text-2xl cursor-pointer dark:text-black text-md hover:scale-110 lg:text-md transition duration-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido dinámico según el tab */}
      <div className="rounded-xl lg:mt-8 md:mt-7 xl:mt-10 md:m-5 m-2 md:pt-5 p-5 bg-gray-100 mt-10 dark:bg-gray-800 min-h-screen">
        {activeTab === 'avisos' && <AvisoPageMock />}
        {activeTab === 'material extra' && <FilePageMock />}
        {activeTab === 'chat grupal' && <ChatGrupalMock />}
        {activeTab === 'Lecturas' && mockLectures.map((post) => <Lecture key={post.lecture} {...post} />)}
        {activeTab === 'Clases' && <ClasesMock />}
      </div>
    </div>
  );
};

export default Cohorte;
