'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AvisoPage from './AvisoPage';
import FilePage from './FilePage';
import Lecture, { lectureProp } from './Lecture';
import ChatGrupal from './ChatGrupal';
import Clases from './Clases';
import MembersList from './MembersList';
import { Cohorte, CohorteMember, CohorteRoleEnum } from '@/services/cohorteService';

interface CohorteDynamicProps {
  cohorte: Cohorte;
  currentUser: {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
    username?: string | null;
    profilePicture?: string | null;
    role?: string;
  };
}

export default function CohorteDynamic({ cohorte, currentUser }: CohorteDynamicProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'avisos');
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Obtener el rol del usuario actual en la cohorte
  const currentMember = cohorte.members?.find((m) => m.user.id === currentUser.id);
  const userCohorteRole = currentMember?.role || CohorteRoleEnum.STUDENT;

  // Verificar permisos
  const isTeacherOrAdmin = userCohorteRole === CohorteRoleEnum.TEACHER || userCohorteRole === CohorteRoleEnum.ADMIN || currentUser.role === 'ADMIN';

  const isTA = userCohorteRole === CohorteRoleEnum.TA;

  // Mock de lecturas (aquí después conectarás al backend)
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

  // Convertir CohorteMember a formato para MembersList
  const mapMemberToUser = (member: CohorteMember) => ({
    id: member.user.id,
    name: member.user.name || '',
    lastName: member.user.lastName || '',
    email: member.user.email,
    profilePicture: member.user.profilePicture || null,
    role: member.role,
  });

  const students = cohorte.members?.filter((m) => m.role === CohorteRoleEnum.STUDENT).map(mapMemberToUser) || [];
  const teachers = cohorte.members?.filter((m) => m.role === CohorteRoleEnum.TEACHER).map(mapMemberToUser) || [];
  const tas = cohorte.members?.filter((m) => m.role === CohorteRoleEnum.TA).map(mapMemberToUser) || [];

  const totalMembers = students.length + teachers.length + tas.length;

  // Actualizar URL cuando cambia el tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white dark:bg-gray-900 pt-16 md:ml-64 relative">
      {/* Imagen de fondo */}
      <div className="relative w-full">
        <img src="/cohorte.png" alt="Fondo" className="w-full h-full object-cover" />

        <div className="absolute inset-0 flex">
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
            <h4 className="md:text-xl text-sm lg:text-5xl px-1 text-black font-extrabold">{cohorte.name.replaceAll(/\D/g, '') || ''}</h4>
          </div>

          {/* Header */}
          <div className="flex flex-col w-[83%]">
            <div className="flex items-center justify-between px-2">
              <p className="text-xs/3 mt-0.5 md:text-xl/4 lg:text-2xl xl:text-3xl text-black">¡Bienvenido a {cohorte.name}!</p>

              {/* Botón de Miembros */}
              <button onClick={() => setShowMembersModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs md:text-sm lg:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="hidden md:inline">Ver Miembros</span>
                <span className="inline md:hidden">{totalMembers}</span>
                <span className="bg-white text-purple-600 rounded-full px-2 py-0.5 text-xs font-bold hidden md:inline">{totalMembers}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-end w-full mt-[8%]">
              <div className="flex w-full px-1 justify-evenly dark:text-white text-xs md:text-md text-black pb-2 lg:text-xl md:text-lg xl:text-lg">
                {['avisos', 'Lecturas', 'Clases', 'material extra', 'chat grupal'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`font-semibold capitalize ${activeTab === tab ? 'rounded-lg px-1 shadow-lg dark:shadow-[#ffff00]/50 shadow-black/50 cursor-pointer dark:text-black text-md bg-[#ffff00] transition duration-300' : 'bg-gray-200 px-1 rounded-lg md:text-lg lg:text-xl xl:text-2xl cursor-pointer dark:text-black text-md hover:scale-110 lg:text-md transition duration-300'}`}
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
        {activeTab === 'avisos' && <AvisoPage cohorteId={cohorte.id} canPost={isTeacherOrAdmin || isTA} currentUserId={currentUser.id} />}
        {activeTab === 'material extra' && <FilePage cohorteId={cohorte.id} canUpload={isTeacherOrAdmin || isTA} />}
        {activeTab === 'chat grupal' && <ChatGrupal cohorteId={cohorte.id} currentUser={currentUser} />}
        {activeTab === 'Lecturas' && mockLectures.map((lecture) => <Lecture key={lecture.lecture} {...lecture} />)}
        {activeTab === 'Clases' && <Clases cohorteId={cohorte.id} canManage={isTeacherOrAdmin} currentUser={currentUser} />}
      </div>

      {/* Modal de Miembros */}
      {showMembersModal && <MembersList students={students} teachers={teachers} tas={tas} onClose={() => setShowMembersModal(false)} />}
    </div>
  );
}
