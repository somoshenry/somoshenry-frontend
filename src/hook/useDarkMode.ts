"use client";

import {useState, useEffect} from "react";

type Mode = "light" | "dark";

export const useDarkMode = () => {
  // 1. FUNCIÓN DE INICIALIZACIÓN
  const getInitialTheme = (): Mode => {
    // A. Prioriza la preferencia guardada en localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme as Mode;
      }
    }

    // B. Si no hay nada guardado, empieza por 'light' (Tu requisito)
    return "light";
  };

  // Inicializa el estado con la preferencia guardada o 'light'
  const [theme, setTheme] = useState<Mode>(getInitialTheme);

  // 2. EFECTO PARA MANIPULAR EL DOM Y GUARDAR LA PREFERENCIA
  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Quita la clase opuesta
    root.classList.remove(theme === "dark" ? "light" : "dark");

    // 2. Aplica la clase actual ('dark' o 'light')
    root.classList.add(theme);

    // 3. Guarda el tema actual en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // 3. FUNCIÓN PARA ALTERNAR
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return [theme, toggleTheme] as const;
};

export default useDarkMode;
