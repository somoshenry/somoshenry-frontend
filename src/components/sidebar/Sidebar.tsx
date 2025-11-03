'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Settings, Workflow, ShieldUser } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Inicio', href: '/home', icon: <Home size={20} /> },
    { name: 'Mi Tablero', href: '/profile', icon: <LayoutDashboard size={20} /> },
    { name: 'Configuración', href: '/config', icon: <Settings size={20} /> },
    { name: 'Planes', href: '/planes', icon: <Workflow size={20} /> },
    { name: 'Administrador', href: '/admin', icon: <ShieldUser size={20} /> },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && <div className=" inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden sticky" onClick={toggle} />}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-16 left-0 h-[calc(100vh-4rem)] dark:bg-gray-900 text-black  bg-white dark:text-white z-40 transition-transform duration-300 ease-in-out
    ${
      isOpen
        ? 'translate-x-0 shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]' // 💡 Aquí se aplica la sombra si está ABIERTO
        : '-translate-x-full'
    }
    w-64
    md:translate-x-0 
    md:shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]  // 💡 Aquí se aplica SIEMPRE en md
  `}
      >
        <div className="p-6">
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Cerrar el menú en móvil al hacer clic
                      if (window.innerWidth < 768) {
                        toggle();
                      }
                    }}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg transition-colors
                      ${pathname === item.href ? 'bg-[#ffff00] text-black font-semibold text-xl' : 'hover:bg-gray-100 hover:scale-105 hover:text-black'}
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
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
