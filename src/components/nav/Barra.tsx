"use client";

import {useState, KeyboardEvent} from "react";
import SearchModal from "./SearchModal";

export const Barra = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Abrir modal al escribir o hacer clic
  const handleFocus = () => {
    setIsFocused(true);
    setIsModalOpen(true);
  };

  // Función de ejemplo para manejar la búsqueda al presionar Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        setIsModalOpen(true);
      }
    }
  };

  return (
    <>
      <div
        className={`flex items-center h-10 grow max-w-xs md:max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border-2 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-lg
            ${
              isFocused
                ? "border-[#ffff00] ring-4 ring-[#ffff00]/30 shadow-xl scale-105"
                : "border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-[#ffff00]"
            }`}
        onClick={handleFocus}
      >
        <div
          className={`pl-4 pr-3 transition-all duration-300 ${
            isFocused ? "text-[#ffff00] scale-110" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Buscar personas o publicaciones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full text-sm md:text-base bg-transparent focus:outline-none pr-4 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium"
          aria-label="Barra de búsqueda"
        />
      </div>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialQuery={query} />
    </>
  );
};

export default Barra;
