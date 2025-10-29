"use client";

import Link from "next/link";
import React from "react";
import Barra from "./Barra";
import useDarkMode from "../hook/useDarkMode";
import {useRouter} from "next/navigation";

export const Nav: React.FC = () => {
  let isAutentic = false;
  const route = useRouter();

  const [theme, toggleTheme] = useDarkMode();
  const iconSrc = theme === 'dark' ? '/modoClaro.png' : '/modoD.png';
  const logoSrc = theme === 'dark' ? '/logoDark.png' : '/logo.jpeg';
  const campanaSrc = theme === 'dark' ? '/campanaD.png' : '/campanaC.png';
  const mensajeSrc = theme === 'dark' ? '/mensajeD.png' : '/mensajeC.png';
  return (
    <nav className=" flex bg-white text-black dark:bg-[#121212] dark:text-white px-1  shadow-[#ffff00] sticky top-0 z-50 box-border w-full  shadow-md/30 md:text-xl items-center justify-between p-1">
      <Link href={'#'}>
        <img src={logoSrc} alt="logo" className="w-24 md:w-36 mr-2 md:mr-4" />
      </Link>
      <div className="grow flex justify-start md:justify-center mx-2 md:mx-auto ">
        <Barra />
      </div>

      {isAutentic ? (
        <div className=" flex shrink-0  items-center ">
          <ol className=" flex items-center md:items-center md:mr-3">
            <li>
              <img
                src={iconSrc}
                alt="light-icon"
                className=" size-6 md:size-10  cursor-pointer md:mr-4 hover:animate-pulse hover:scale-105"
                onClick={() => {
                  toggleTheme();
                }}
              />
            </li>
            <li className="relative md:mr-5 mr-2">
              <img src={campanaSrc} alt="campana.png" className="size-7 md:size-8 cursor-pointer hover:scale-105" />
              <span className=" bg-red-500  text-white absolute -top-1 -right-1 md:-top-1 md:-right-3 rounded-full px-1 py-0.5 md:px-2 md:py-0.5 text-xs font-bold">1</span>
            </li>
            <li className="relative md:mr-2">
              <img src={mensajeSrc} alt="mensaje.png" className="size-7 md:size-8 cursor-pointer hover:scale-105" />
              <span className=" bg-[#ffff00] dark:text-black text-coral absolute -top-1 -right-1 md:-top-1 md:-right-3 rounded-full  px-2 py-0.5 text-xs font-bold">1</span>
            </li>
          </ol>

          <img src="/user.png" alt="mensaje.png" className="mr-1 size-7 bg-[#ffff00] md:size-12 mx-2 cursor-pointer hover:outline-2 hover:outline-black rounded-full" />
        </div>
      ) : (
        <div className=" flex  justify-between items-center md:mr-2">
          <img
            src={iconSrc}
            alt="light-icon"
            className=" size-6 md:size-10  cursor-pointer md:mr-4 hover:animate-pulse hover:scale-105"
            onClick={() => {
              toggleTheme();
            }}
          />
          <button
            className=" border gap-1
           flex items-center border-black rounded-xl px-2 py-1 dark:border-white text-center mx-2 cursor-pointer hover:bg-[#ffff00] transition duration-100 ease-in-out text-sm md:text-lg"
            onClick={() => {
              route.push("/login");
            }}
          >
            Iniciar seccion
          </button>
          <button
            className=" bg-[#ffff00] rounded-xl px-2 py-2 text-center text-black cursor-pointer hover:bg-white hover:outline-1 hover:outline-black transition duration-150 ease-in-out text-sm md:text-lg"
            onClick={() => {
              route.push("/register");
            }}
          >
            Crear cuenta
          </button>
        </div>
      )}
    </nav>
  );
};

export default Nav;
