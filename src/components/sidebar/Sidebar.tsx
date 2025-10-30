"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, toggle}) => {
  const pathname = usePathname();

  const menuItems = [
    {name: "Inicio", icon: "🏠", href: "/dashboard"},
    {name: "Mi Tablero", icon: "📊", href: "/dashboard/tablero"},
    {name: "Configuración", icon: "⚙️", href: "/settings"},
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggle} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-[#1a1a1a] text-white z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 w-64
        `}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#ffff00] mb-8">Mi Red Social</h2>

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
                      ${pathname === item.href ? "bg-[#ffff00] text-black font-semibold" : "hover:bg-gray-800"}
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
