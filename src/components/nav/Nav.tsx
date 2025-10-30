"use client";

import Link from "next/link";
import React, {useState} from "react";
import Barra from "./Barra";
import {useRouter} from "next/navigation";
import useDarkMode from "@/src/hook/useDarkMode";
import MobileMenuButton from "../sidebar/MobileMenuButton";
import Sidebar from "../sidebar/Sidebar";

export const Nav: React.FC = () => {
  const isAutentic = false;
  const route = useRouter();

  const [theme, toggleTheme] = useDarkMode();
  const iconSrc = theme === "dark" ? "/modoClaro.png" : "/modoD.png";
  const logoSrc = theme === "dark" ? "/logoD.png" : "/logoC.jpeg";
  const logoSrcM = theme === "dark" ? "/logoDM.png" : "/logoCM.jpeg";
  const campanaSrc = theme === "dark" ? "/campanaD.png" : "/campanaC.png";
  const mensajeSrc = theme === "dark" ? "/mensajeD.png" : "/mensajeC.png";

  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    // 1. Verifica si estamos en el navegador (lado del cliente)
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }

    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen((prev) => !prev);
    }
  };

  return (
    <>
      <nav
        className="flex bg-white text-black dark:bg-gray-900 dark:text-white px-1 shadow-[#ffff00] fixed top-0 left-0 h-16 z-50 
        box-border w-full shadow-md/30 md:text-xl items-center justify-between p-1"
      >
        <MobileMenuButton isOpen={isMenuOpen} toggle={toggleMenu} />

        <Link href={"#"} className="shrink-0 md:hidden">
          <img src={logoSrcM} alt="logo-movil" className="w-10 mr-1" />
        </Link>
        <Link href={"#"} className="hidden shrink-0 md:block">
          <img src={logoSrc} alt="logo-desktop" className="w-24 md:w-36 mr-2 md:mr-4" />
        </Link>

        <div className="grow flex justify-center mx-2">
          <Barra />
        </div>
        {isAutentic ? (
          <div className="flex shrink-0 items-center">
            <ol className="flex items-center">
              <li>
                <img
                  src={iconSrc}
                  alt="light-icon"
                  className="size-10 md:size-10 cursor-pointer mx-1 md:mr-4 hover:animate-pulse hover:scale-105"
                  onClick={toggleTheme}
                  title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                />
              </li>
              <li className="relative md:mr-5 mr-2">
                <img src={campanaSrc} alt="campana.png" className="size-7 md:size-8 cursor-pointer hover:scale-105" />
                <span className="bg-red-500 text-white absolute -top-1 -right-1 rounded-full text-[10px] px-1 font-bold md:px-2 md:py-0.5 md:text-xs">
                  1
                </span>
              </li>
              <li className="relative md:mr-2">
                <img src={mensajeSrc} alt="mensaje.png" className="size-7 md:size-8 cursor-pointer hover:scale-105" />
                <span className="bg-[#ffff00] dark:text-black absolute -top-1 -right-1 rounded-full text-[10px] px-1 font-bold md:px-2 md:py-0.5 md:text-xs">
                  1
                </span>
              </li>
            </ol>

            <img
              src="/user.png"
              alt="mensaje.png"
              className="size-7 bg-[#ffff00] md:size-12 ml-2 cursor-pointer hover:ring-2 hover:ring-black rounded-full"
            />
          </div>
        ) : (
          <div className="flex shrink-0 items-center">
            <img
              src={iconSrc}
              alt="light-icon"
              className="size-6 md:size-10 cursor-pointer md:mr-4 hover:animate-pulse hover:scale-105"
              onClick={toggleTheme}
            />
            <button
              className="border gap-1 flex items-center border-black rounded-xl px-2 py-1 dark:border-white text-center mx-2 cursor-pointer hover:bg-[#ffff00] transition duration-100 ease-in-out text-sm md:text-lg"
              onClick={() => {
                route.push("/login");
              }}
            >
              Iniciar sesión
            </button>
            <button
              className="bg-[#ffff00] rounded-xl px-2 py-2 text-center text-black cursor-pointer hover:bg-white hover:outline-1 hover:outline-black transition duration-150 ease-in-out text-sm md:text-lg"
              onClick={() => {
                route.push("/register");
              }}
            >
              Crear cuenta
            </button>
          </div>
        )}
      </nav>

      <Sidebar isOpen={isMenuOpen} toggle={toggleMenu} />
    </>
  );
};

export default Nav;
