const Cohorte = () => {
  return (
    <div className="h-full bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <div className="relative w-full">
        <img src="/cohorte.png" alt="Fondo" className="w-full h-full object-cover" />

        <div className="absolute inset-0 flex pl-1 md:pl-3">
          <div
            // Ajustamos el tamaño: size-24 (96px) para móvil y md:size-44 para escritorio
            className="size-20  md:size-48 flex items-center justify-center overflow-hidden"
            // CLAVE: backgroundSize: "contain" asegura que la imagen se vea COMPLETA
            style={{
              backgroundImage: "url(/logoCohorte.png)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <h4 className="md:text-5xl text-xs px-1 text-black font-extrabold bg-opacity-60 md:px-4 py-2">68</h4>
          </div>

          <div className="flex flex-col w-full box-border">
            <div className=" md:mt-7 mt-1 md:ml-17 ml-5 mr-3  flex items-center">
              <p className="md:text-2xl text-xs text-black w-full">¡Bienvenido a tu cohorte!</p>
              <div className="flex justify-end w-full">
                <button className="bg-white hover:scale-105 hover:bg-gray-100 mr-3 ml-5 md:p-3 rounded-lg dark:bg-gray-900 dark:text-white text-black font-bold md:py-2 px-2 text-xs md:h-11 h-6 md:text-lg transition duration-300 cursor-pointer">
                  Integrantes
                </button>
                <button className="bg-white hover:scale-105 cursor-pointer text-xs hover:bg-gray-100 dark:bg-gray-900 rounded-lg dark:text-white text-black font-bold h-6 md:h-11 px-2 py-1 md:text-lg md:px-2 md-py-2 transition duration-300">
                  Maestros
                </button>
              </div>
            </div>

            <div className="flex md:mt-12 mt-2 justify-end w-full pt-3">
              <ul className="flex w-full justify-evenly px-3 dark:text-white text-sm md:text-lg text-black pb-2">
                <li className="bg-[#ffff00] px-4 rounded-lg cursor-pointer mr-8 md:mr-30 dark:text-black text-md  hover:scale-105 transition duration-300">
                  Avisos
                </li>
                <li className="bg-[#ffff00] px-4 rounded-lg cursor-pointer mr-8 md:mr-30 dark:text-black text-md hover:scale-105 transition duration-300">
                  Material
                </li>
                <li className="bg-[#ffff00] px-4 rounded-lg cursor-pointer dark:text-black text-md hover:scale-105 transition duration-300">
                  Grupo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className=" rounded-xl md:m-5 m-2 md:pt-5 pt-2 p-5 bg-gray-100  dark:bg-gray-800 min-h-screen"></div>
    </div>
  );
};
export default Cohorte;
