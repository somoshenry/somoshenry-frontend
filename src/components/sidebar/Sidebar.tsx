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
} from 'lucide-react';
import { useAuth } from '@/hook/useAuth';
import { getMyCohortes } from '@/services/cohorteService';

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
        const cohortes = await getMyCohortes();

        const myCohortes = cohortes.filter((c) => c.members?.some((m) => m.user.id === user.id) || user.role === 'ADMIN');

        setUserCohortes(myCohortes);
      } catch (error) {
        console.error('Error al obtener cohortes del usuario:', error);
      } finally {
        setLoadingCohortes(false);
      }
    };

    fetchUserCohortes();
  }, [user]);

  const handleCohorteClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (userCohortes.length === 1) {
      router.push(`/cohorte/${userCohortes[0].id}`);
    } else if (userCohortes.length > 1) {
      router.push('/cohorte');
    } else {
      alert('No tienes cohortes asignadas');
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
    { name: 'Cohorte 68 (Mock)', href: '/cohorte-mock', icon: <BookOpenText size={20} /> },
    {
      name: 'Mis Cohortes',
      href: '/cohorte',
      icon: <BookOpenText size={20} />,
      onClick: handleCohorteClick,
      badge: userCohortes.length,
    },
    { name: 'Planes', href: '/planes', icon: <Workflow size={20} /> },

    ...(user?.role === 'ADMIN' ? [{ name: 'Administrador' as const, href: '/admin', icon: <ShieldUser size={20} /> }] : []),
  ];

  return (
    <>
      {isOpen && <div className=" inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden sticky" onClick={toggle} />}

      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] 
          dark:bg-gray-900 text-black bg-white dark:text-white 
          z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]' : '-translate-x-full'}
          w-64
          md:translate-x-0 
          md:shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]
        `}
      >
        <div className="p-6">
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${pathname.startsWith(item.href) ? 'bg-[#ffff00] text-black font-semibold text-xl' : 'hover:bg-gray-100 hover:scale-105 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'}
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>

                      {'badge' in item && item.badge && item.badge > 0 && <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-1 rounded-full">{item.badge}</span>}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          toggle();
                        }
                      }}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${pathname === item.href ? 'bg-[#ffff00] text-black font-semibold text-xl' : 'hover:bg-gray-100 hover:scale-105 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'}
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
