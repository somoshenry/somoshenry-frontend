'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingNavbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-black shadow-sm z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FFFF00] rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-xl">H</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">somosHenry</span>
          </Link>

          {/* Botones derecha */}
          <div className="flex items-center space-x-3">
            {/* Toggle Dark Mode */}
            <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle dark mode">
              {darkMode ? (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Iniciar sesión */}
            <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2">
              Iniciar sesión
            </Link>

            {/* Crear cuenta */}
            <Link href="/signup" className="bg-[#FFFF00] text-black text-sm px-5 py-2 rounded-md font-semibold hover:bg-yellow-400">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
