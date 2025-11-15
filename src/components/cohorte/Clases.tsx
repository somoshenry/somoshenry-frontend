"use client";

import {useState} from "react";

const Clases = () => {
  const [activeButton, setActiveButton] = useState("");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  // Función para obtener las clases del TEXTO de cada botón
  const getButtonTextClass = (buttonName: string) => {
    const baseClasses = " cursor-pointer text-black text-sm w-[50%] text-center relative z-10";
    if (activeButton === buttonName) {
      return "font-bold " + baseClasses;
    } else {
      return baseClasses;
    }
  };

  return (
    <div className="bg-white p-1.5 flex justify-between items-center w-[30%] gap-2 mx-auto rounded-full relative overflow-hidden">
      {/* La pastilla deslizante */}
      <div
        className={`
          absolute  left-0 py-1 h-full w-1/2 rounded-full bg-[#ffff00] 
          transition-transform duration-300 ease-in
          ${activeButton === "sub" ? "translate-x-full" : "translate-x-0"}
          ${activeButton === "hang" ? "translate-x-0" : "translate-x-ful"}
        `}
      ></div>

      <button className={getButtonTextClass("hang")} onClick={() => handleButtonClick("hang")}>
        Hang zone
      </button>

      <button className={getButtonTextClass("sub")} onClick={() => handleButtonClick("sub")}>
        Sub
      </button>
    </div>
  );
};

export default Clases;
