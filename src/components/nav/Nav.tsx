'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Barra from './Barra';
import { useRouter } from 'next/navigation';
import useDarkMode from '@/src/hook/useDarkMode';
import MobileMenuButton from '../sidebar/MobileMenuButton';
import Sidebar from '../sidebar/Sidebar';
import { useAuth } from '@/src/hook/useAuth';

export const Nav: React.FC = () => {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [theme, toggleTheme] = useDarkMode();
  const iconSrc = theme === 'dark' ? '/modoClaro.png' : '/modoD.png';
  const logoSrc = theme === 'dark' ? '/logoD.png' : '/logoC.jpeg';
  const logoSrcM = theme === 'dark' ? '/logoDM.png' : '/logoCM.jpeg';
  const campanaSrc = theme === 'dark' ? '/campanaD.png' : '/campanaC.png';
  const mensajeSrc = theme === 'dark' ? '/mensajeD.png' : '/mensajeC.png';

  // Lógica mejorada para el manejo del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    // Verifica si estamos en el navegador (lado del cliente)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen((prev) => !prev);
    }
  };

  // Esperar a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar el menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mostrar un skeleton mientras carga
  if (!mounted || loading) {
    return (
      <nav className="flex bg-white text-black dark:bg-[#121212] dark:text-white px-1 shadow-[#ffff00] fixed top-0 left-0 h-16 z-50 box-border w-full shadow-md/30 md:text-xl items-center justify-between p-1">
        <div className="shrink-0 md:hidden">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="hidden shrink-0 md:block">
          <div className="w-36 h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grow flex justify-center mx-2">
          <div className="w-full max-w-xs md:max-w-md h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="flex shrink-0 items-center space-x-2">
          <div className="size-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex bg-white text-black dark:bg-[#121212] dark:text-white px-1 shadow-[#ffff00] fixed top-0 left-0 h-16 z-50 box-border w-full shadow-md/30 md:text-xl items-center justify-between p-1">
        {/* Botón de menú móvil: SOLO visible en móvil cuando está autenticado */}
        {user && (
          <div className="md:hidden">
            <MobileMenuButton isOpen={isMenuOpen} toggle={toggleMenu} />
          </div>
        )}

        <Link href={user ? '/dashboard' : '/'} className="shrink-0 md:hidden">
          <img src={logoSrcM} alt="logo-movil" className="w-10 mr-1" />
        </Link>
        <Link href={user ? '/dashboard' : '/'} className="hidden shrink-0 md:block">
          <img src={logoSrc} alt="logo-desktop" className="w-24 md:w-36 mr-2 md:mr-4" />
        </Link>

        {/* Barra de búsqueda: SOLO visible cuando el usuario está autenticado */}
        {user && (
          <div className="grow flex justify-center mx-2">
            <Barra />
          </div>
        )}

        {/* Si no está autenticado, usar flex-grow para mantener el espacio */}
        {!user && <div className="grow"></div>}

        {user ? (
          // Usuario autenticado
          <div className="flex shrink-0 items-center">
            <ol className="flex items-center">
              <li>
                <img src={iconSrc} alt="toggle-theme" className="size-6 md:size-10 cursor-pointer mx-1 md:mr-4 hover:animate-pulse hover:scale-105" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} />
              </li>
              <li className="relative md:mr-5 mr-2">
                <img src={campanaSrc} alt="notificaciones" className="size-5 md:size-8 cursor-pointer hover:scale-105" title="Notificaciones" />
                <span className="bg-red-500 text-white absolute -top-1 -right-1 rounded-full text-[10px] px-1 font-bold md:px-2 md:py-0.5 md:text-xs">1</span>
              </li>
              <li className="relative md:mr-2">
                <img src={mensajeSrc} alt="mensajes" className="size-5 md:size-8 cursor-pointer hover:scale-105" title="Mensajes" />
                <span className="bg-[#ffff00] dark:text-black absolute -top-1 -right-1 rounded-full text-[10px] px-1 font-bold md:px-2 md:py-0.5 md:text-xs">1</span>
              </li>
            </ol>

            {/* Dropdown de usuario con toggle en móvil */}
            <div className="relative user-menu-container">
              <img src="/user.png" alt="usuario" className="size-7 bg-[#ffff00] md:size-12 ml-2 cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white rounded-full" title="Mi cuenta" onClick={() => setShowUserMenu(!showUserMenu)} />

              {/* Menú desplegable - funciona con hover en desktop y click en mobile */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg transition-all duration-200 z-50
                  ${showUserMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}
                  md:group-hover:opacity-100 md:group-hover:visible`}
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold truncate">
                    {user.name} {user.avatar}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{user.role === 'user' ? 'Docente' : 'Estudiante'}</p>
                </div>
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Mi perfil
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Configuración
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Usuario no autenticado
          <div className="flex shrink-0 items-center space-x-2">
            <img src={iconSrc} alt="toggle-theme" className="size-6 md:size-10 cursor-pointer hover:animate-pulse hover:scale-105" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} />
            <button className="border gap-1 flex items-center border-black rounded-xl px-2 py-1 dark:border-white text-center cursor-pointer hover:bg-[#ffff00] hover:text-black transition duration-100 ease-in-out text-sm md:text-lg whitespace-nowrap" onClick={() => router.push('/login')}>
              Iniciar sesión
            </button>
            <button className="bg-[#ffff00] rounded-xl px-2 py-2 text-center text-black cursor-pointer hover:bg-white hover:outline hover:outline-1 hover:outline-black transition duration-150 ease-in-out text-sm md:text-lg whitespace-nowrap" onClick={() => router.push('/register')}>
              Crear cuenta
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar: 
          - En móvil: solo visible cuando isMenuOpen es true
          - En desktop: siempre visible cuando hay usuario autenticado
      */}
      {user && <Sidebar isOpen={isMenuOpen} toggle={toggleMenu} />}
    </>
  );
};

export default Nav;
