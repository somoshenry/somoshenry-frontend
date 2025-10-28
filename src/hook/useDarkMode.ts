"use client"; // Necesario para usar Hooks y estado en el cliente

import {useState, useEffect} from "react";

type Mode = "light" | "dark";

export const useDarkMode = () => {
  // Función para obtener la preferencia inicial del sistema operativo
  const getInitialTheme = (): Mode => {
    // Comprueba si estamos en el navegador y si el SO prefiere 'dark'
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  // Inicializa el estado con la preferencia del sistema
  const [theme, setTheme] = useState<Mode>(getInitialTheme);

  // Este efecto se ejecuta cada vez que 'theme' cambia
  useEffect(() => {
    const root = window.document.documentElement; // Accede a la etiqueta <html>

    // 1. Quita la clase opuesta para evitar conflictos
    root.classList.remove(theme === "dark" ? "light" : "dark");

    // 2. Aplica la clase actual ('dark' o 'light')
    root.classList.add(theme);
  }, [theme]); // La dependencia [theme] asegura que se ejecute al cambiar el tema

  // Función para alternar el tema
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  // Devuelve el estado actual y la función para cambiarlo
  return [theme, toggleTheme] as const;
};
export default useDarkMode;
