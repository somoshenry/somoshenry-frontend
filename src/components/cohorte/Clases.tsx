"use client";

import {useState} from "react";
import ClaseHang from "./ClaseHang"; // Contenido de la primera vista
import ClassSub from "./ClassSub"; // Contenido de la segunda vista

const Clases = () => {
  const [activeButton, setActiveButton] = useState<"hang" | "sub">("hang");

  const handleButtonClick = (buttonName: "hang" | "sub") => {
    setActiveButton(buttonName);
  };

  // Función para obtener las clases del TEXTO de cada botón
  const getButtonTextClass = (buttonName: "hang" | "sub") => {
    // NOTA: W-[50%] es redundante si están envueltos en un div flex que cubre el 100%
    const baseClasses = "text-sm w-1/2 text-center relative z-10 py-1 transition-colors duration-300";
    if (activeButton === buttonName) {
      return "font-bold text-black " + baseClasses;
    } else {
      return "text-gray-600 " + baseClasses;
    }
  };

  return (
    <>
      <div className="w-full md:w-[25%] text-center">
        <div className="bg-white p-1.5 flex justify-between items-center w-full   rounded-full relative overflow-hidden">
          <div
            className={`absolute left-0 w-1/2 rounded-full h-[80%] bg-[#ffff00] transition-transform duration-300 ease-in ${
              activeButton === "sub" ? "translate-x-[97%] bg-green-400" : "translate-x-1 bg-sky-400"
            }`}
          ></div>
          {/* 1.2. Botones (Deben ser hermanos del slider) */}
          <button className={getButtonTextClass("hang")} onClick={() => handleButtonClick("hang")}>
            Hang zone
          </button>

          <button className={getButtonTextClass("sub")} onClick={() => handleButtonClick("sub")}>
            Sub
          </button>
        </div>
        {/* ---------------------------------------------------- */}

        {/* --- 2. CONTENIDO CONDICIONAL (LAS "PÁGINAS") --- */}
      </div>
      <div className="mt-6 w-full">
        {/* Aquí usamos el estado para renderizar la vista correcta */}
        {activeButton === "hang" && <ClaseHang theme={"hang"} />}
        {activeButton === "sub" && <ClassSub theme={"sub"} />}
      </div>
    </>
  );
};

export default Clases;
