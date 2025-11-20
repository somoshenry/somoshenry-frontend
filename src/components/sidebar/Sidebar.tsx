'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Settings,
  Workflow,
  ShieldUser,
  MessageCircle,
  BookOpenText,
  Video, // ⭐ NUEVO ICONO
  PhoneOff, // ⭐ ICONO PARA SALIR DE LLAMADA
} from 'lucide-react';
import { useAuth } from '@/hook/useAuth';
import { getMyCohortes } from '@/services/cohorteService';
import Swal from 'sweetalert2';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [userCohortes, setUserCohortes] = useState<any[]>([]);
  const [loadingCohortes, setLoadingCohortes] = useState(false);

  useEffect(() => {
    const fetchUserCohortes = async () => {
      if (!user) return;
      try {
        setLoadingCohortes(true);
        // Pasar el rol del usuario para que ADMIN vea todas las cohortes
        const cohortes = await getMyCohortes(user.role);
        setUserCohortes(cohortes);
      } catch (error) {
        console.error('Error al obtener cohortes del usuario:', error);
      } finally {
        setLoadingCohortes(false);
      }
    };

    fetchUserCohortes();

    // Listener para recargar cohortes cuando se recibe notificación de asignación
    const handleCohorteAssigned = () => {
      console.log('🎓 Cohorte asignada - recargando lista');
      fetchUserCohortes();
    };

    globalThis.addEventListener('notification:cohorte_assigned', handleCohorteAssigned);

    return () => {
      globalThis.removeEventListener('notification:cohorte_assigned', handleCohorteAssigned);
    };
  }, [user]);

  const handleCohorteClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (userCohortes.length === 1) {
      router.push(`/cohorte/${userCohortes[0].id}`);
    } else if (userCohortes.length > 1) {
      router.push('/cohorte');
    } else {
      Swal.fire({
        title: 'Atención',
        text: 'No tienes cohortes asignadas',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
    }

    if (window.innerWidth < 768) {
      toggle();
    }
  };

  // ⭐ ACÁ AGREGAMOS EL NUEVO BOTÓN ⭐
  const menuItems = [
    { name: 'Inicio', href: '/home', icon: <Home size={20} /> },
    { name: 'Mi Tablero', href: '/profile', icon: <LayoutDashboard size={20} /> },
    { name: 'Mensajes', href: '/chat', icon: <MessageCircle size={20} /> },

    // ⭐ NUEVO ITEM DEL SIDEBAR: "Clases en Vivo"
    { name: 'Clases en Vivo', href: '/live/create', icon: <Video size={20} /> },

    { name: 'Configuración', href: '/config', icon: <Settings size={20} /> },
    // { name: 'Cohorte 68 (Mock)', href: '/cohorte-mock', icon: <BookOpenText size={20} /> }, // 🔒 COMENTADO PARA PRE-DEMO

    // Este item usa botón, NO link
    { name: 'Mis Cohortes', href: '/cohorte', icon: <BookOpenText size={20} />, onClick: handleCohorteClick, badge: userCohortes.length },

    { name: 'Planes', href: '/planes', icon: <Workflow size={20} /> },

    ...(user?.role === 'ADMIN' ? [{ name: 'Administrador' as const, href: '/admin', icon: <ShieldUser size={20} /> }] : []),
  ];

  // ⭐ NUEVO: Detectar si estamos en una videollamada
  const isInVideoCall = pathname?.startsWith('/live/') && pathname !== '/live/create';

  return (
    <>
      {isOpen && <div className=" inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden sticky" onClick={toggle} />}

      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] dark:bg-gray-900 text-black bg-white dark:text-white
          z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]' : '-translate-x-full'}
          w-64 md:translate-x-0 md:shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]
        `}
      >
        <div className="p-6">
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.name}>
                  {/* 🔥 SI TIENE onClick → BOTÓN */}
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${
                          item.href && pathname.startsWith(item.href)
                            ? 'bg-[#ffff00] text-black font-semibold text-xl'
                            : 'hover:bg-gray-100 hover:scale-105 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>

                      {/* Badge */}
                      {'badge' in item && item.badge > 0 && (
                        <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-1 rounded-full">{item.badge}</span>
                      )}
                    </button>
                  ) : (
                    /* 🔥 SI ES LINK NORMAL */
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) toggle();
                      }}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${
                          pathname === item.href
                            ? 'bg-[#ffff00] text-black font-semibold text-xl'
                            : 'hover:bg-gray-100 hover:scale-105 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}

              {/* ⭐ BOTÓN ESPECIAL: Solo aparece cuando estás en videollamada */}
              {isInVideoCall && (
                <li>
                  <Link
                    href="/live/create"
                    onClick={() => {
                      if (window.innerWidth < 768) toggle();
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white font-semibold animate-pulse"
                  >
                    <span className="text-xl">
                      <PhoneOff size={20} />
                    </span>
                    <span>Salir de videollamada</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
