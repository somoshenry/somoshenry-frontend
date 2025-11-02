'use client';

import { useState, KeyboardEvent } from 'react';

export const Barra = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Función de ejemplo para manejar la búsqueda al presionar Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        console.log('Búsqueda ejecutada:', query);
        // Aquí podrías disparar tu lógica de búsqueda
      }
    }
  };

  return (
    <div
      className={`flex items-center h-8 grow max-w-xs md:max-w-md bg-gray-100 rounded-full border border-transparent transition duration-300 ease-in-out
          ${isFocused ? 'border-[#ffff00] ring-2 ring-[#ffff00] shadow-md' : 'hover:border-gray-300 '}`}
    >
      <div className="pl-1 pr-3 text-gray-500 ">
        <img src="/lupa.png" alt="lupa" className="md:size-5 size-4" />
      </div>

      <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="w-full h-full text-sm md:text-lg bg-transparent focus:outline-none pr-4 placeholder-gray-500 " aria-label="Barra de búsqueda" />
    </div>
  );
};

export default Barra;
