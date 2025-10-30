"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Home, LayoutDashboard, Settings} from "lucide-react";
import clsx from "clsx";
import {motion} from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({isOpen, toggle}: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {name: "Inicio", href: "/", icon: <Home size={20} />},
    {name: "Mi Tablero", href: "/tablero", icon: <LayoutDashboard size={20} />},
    {name: "Configuración", href: "/configuracion", icon: <Settings size={20} />},
  ];

  return (
    <>
      {isOpen && <div onClick={toggle} className=" inset-0 bg-black/60 z-50 md:hidden sticky top-0 "></div>}

      <motion.aside
        initial={{x: "-110%"}}
        animate={{x: isOpen ? 0 : "-110%"}}
        transition={{type: "spring", stiffness: 260, damping: 25}}
        className={clsx(
          "fixed left-0 z-40 w-64 dark:bg-gray-900 dark:text-white flex flex-col p-4 bg-white text-black",
          "top-16 h-[calc(100%-4rem)]",
          "shadow-[4px_0_15px_-3px_rgba(255,255,0,0.5)]",
          " md:translate-x-0 md:flex md:h-screen md:w-64 md:fixed md:left-0 md:z-40"
        )}
      >
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#ffff00] transition",
                pathname === link.href && "bg-gray-800 text-yellow-400"
              )}
              onClick={toggle}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
