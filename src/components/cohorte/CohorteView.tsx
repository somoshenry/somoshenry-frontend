'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { getCohorteById } from '@/services/cohorteService';
import { useAuth } from '@/hook/useAuth';
import GenericList, { UserResult } from '@/components/ui/GenericList';
import FilePage from '@/components/cohorte/FilePage';
import Lecture, { lectureProp } from '@/components/cohorte/Lecture';
import ChatGrupal from '@/components/cohorte/ChatGrupal';
import { useSearchParams } from 'next/navigation';
import AvisoPage from './AvisoPage';
import Clases from './Clases';

interface CohorteViewProps {
  cohorteId: string;
}

export default function CohorteView({ cohorteId }: CohorteViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [cohorte, setCohorte] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

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
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);
  const [showTA, setShowTA] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Verificar acceso y obtener cohorte
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const cohorteData = await getCohorteById(cohorteId);
        setCohorte(cohorteData);

        // Verificar si el usuario es miembro de esta cohorte
        const isMember = cohorteData.members?.some((member: any) => member.user.id === user.id);

        // Admin puede ver todas las cohortes
        if (user.role === 'ADMIN' || isMember) {
          setHasAccess(true);
          // Convertir members a UserResult
          if (cohorteData.members) {
            const mappedUsers: UserResult[] = cohorteData.members.map((member: any) => ({
              id: member.user.id,
              name: member.user.name,
              lastName: member.user.lastName,
              email: member.user.email,
              profilePicture: member.user.profilePicture,
              role: member.role,
            }));
            setUserResults(mappedUsers);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error al obtener cohorte:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [cohorteId, user, router]);

  // 🔹 Filtrar usuarios por rol
  const students = userResults.filter((u) => u.role === 'STUDENT');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando cohorte...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No tienes permiso para acceder a esta cohorte. Solo los miembros asignados pueden verla.</p>
          <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!cohorte) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cohorte no encontrada</p>
      </div>
    );
  }

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
            <h4 className="md:text-xl text-sm lg:text-5xl px-1 text-black font-extrabold">{cohorte.name.replace(/\D/g, '') || ''}</h4>
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
                  {showStudents && students.length > 0 && <GenericList data={students} onClose={() => setShowStudents(false)} />}
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
                  {showTeachers && teachers.length > 0 && <GenericList data={teachers} onClose={() => setShowTeachers(false)} />}
                </div>

                {/* TA */}
                <div className="relative">
                  <button
                    className="bg-white hover:scale-105 hover:bg-gray-100 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold py-1 px-2 text-xs md:h-7 md:mt-2 h-6 md:text-xs lg:h-8 lg:text-md lg:px-3 lg:py-0 transition duration-300 cursor-pointer lg:mt-4 xl:text-xl xl:px-4 xl:py-2 xl:h-12"
                    onClick={() => {
                      setShowTA(!showTA);
                      setShowStudents(false);
                      setShowTeachers(false);
                    }}
                  >
                    TA
                  </button>
                  {showTA && tasistand.length > 0 && <GenericList data={tasistand} onClose={() => setShowTA(false)} />}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto mt-1 md:mt-4 lg:mt-8 gap-1 md:gap-3 px-2 scrollbar-hide">
              <button className={`${activeTab === 'avisos' ? 'bg-yellow-400 text-black dark:bg-yellow-500' : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'} rounded-lg font-bold py-0 px-1 text-xs md:py-2 md:px-4 md:text-base lg:text-lg xl:text-xl hover:scale-105 transition duration-300 whitespace-nowrap`} onClick={() => setActiveTab('avisos')}>
                Avisos
              </button>
              <button className={`${activeTab === 'lecturas' ? 'bg-yellow-400 text-black dark:bg-yellow-500' : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'} rounded-lg font-bold py-0 px-1 text-xs md:py-2 md:px-4 md:text-base lg:text-lg xl:text-xl hover:scale-105 transition duration-300 whitespace-nowrap`} onClick={() => setActiveTab('lecturas')}>
                Lecturas
              </button>
              <button className={`${activeTab === 'clases' ? 'bg-yellow-400 text-black dark:bg-yellow-500' : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'} rounded-lg font-bold py-0 px-1 text-xs md:py-2 md:px-4 md:text-base lg:text-lg xl:text-xl hover:scale-105 transition duration-300 whitespace-nowrap`} onClick={() => setActiveTab('clases')}>
                Clases
              </button>
              <button className={`${activeTab === 'material' ? 'bg-yellow-400 text-black dark:bg-yellow-500' : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'} rounded-lg font-bold py-0 px-1 text-xs md:py-2 md:px-4 md:text-base lg:text-lg xl:text-xl hover:scale-105 transition duration-300 whitespace-nowrap`} onClick={() => setActiveTab('material')}>
                Material Extra
              </button>
              <button className={`${activeTab === 'chat' ? 'bg-yellow-400 text-black dark:bg-yellow-500' : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'} rounded-lg font-bold py-0 px-1 text-xs md:py-2 md:px-4 md:text-base lg:text-lg xl:text-xl hover:scale-105 transition duration-300 whitespace-nowrap`} onClick={() => setActiveTab('chat')}>
                Chat Grupal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div className="p-4 md:p-6">
        {activeTab === 'avisos' && <AvisoPage cohorteId={cohorteId} />}

        {activeTab === 'lecturas' && (
          <div className="space-y-4">
            {mockLectures.map((lecture) => (
              <Lecture key={lecture.lecture} {...lecture} />
            ))}
          </div>
        )}

        {activeTab === 'clases' && <Clases />}

        {activeTab === 'material' && <FilePage />}

        {activeTab === 'chat' && <ChatGrupal groupId={cohorteId} groupName={cohorte.name} />}
      </div>
    </div>
  );
}
