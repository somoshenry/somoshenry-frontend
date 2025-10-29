'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FFFF00] rounded-lg flex items-center justify-center shadow-md">
            <span className="text-black font-bold text-xl">H</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">somosHenry</span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle dark mode">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isDarkMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              )}
            </svg>
          </button>

          {/* Iniciar sesión */}
          <Link href="/login" className="text-gray-700 font-medium hover:text-gray-900 transition-colors px-4 py-2">
            Iniciar sesión
          </Link>

          {/* Crear cuenta */}
          <Link href="/register" className="bg-[#FFFF00] text-black font-semibold px-6 py-2 rounded-lg hover:bg-[#FFFF33] transition-colors shadow-md hover:shadow-lg transform hover:scale-105">
            Crear cuenta
          </Link>
        </div>
      </div>
    </nav>
  );
}
