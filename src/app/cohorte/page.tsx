import CardMensaje, {CardMensajeProps} from "@/components/cohorte/ProfesorCard";

const mockedPosts: CardMensajeProps[] = [
  {
    nombre: "Dr. Ana López",
    rol: "Decana de Ingeniería",
    fecha: "16:45 · 2 Nov", // Formato string simplificado
    titulo: "Recordatorio: ¡Semana de Proyectos Finales!",
    mensaje:
      "Estimados alumnos, les recuerdo que esta semana es crucial para sus proyectos. No olviden subir sus avances y cumplir con los requisitos del manual. ¡Éxito a todos!",
    linkConectate: "https://plataforma.uni.edu/proyectos",
  },
  {
    nombre: "Lic. Raúl Martínez",
    rol: "Profesor de Matemáticas",
    fecha: "09:10 · 30 Oct",
    titulo: "Aviso: Cambio de horario en Tutorías",
    mensaje:
      "Por motivos de un seminario, la tutoría de este viernes 3 de noviembre se moverá de 10:00 AM a 12:00 PM. Por favor, revisen el aula asignada en la plataforma.",
    linkConectate: undefined, // Esta publicación no tiene enlace
  },
  {
    nombre: "Mtra. Sofía Vargas",
    rol: "Coordinadora de Posgrado",
    fecha: "11:20 · 1 Nov",
    titulo: "¡Conferencia Invitada la Próxima Semana!",
    mensaje:
      "Tendremos el honor de recibir al Dr. Kenji Sato, experto en IA ética, el martes. Es una oportunidad única para aprender sobre las últimas tendencias. ¡No falten!",
    linkConectate: "https://zoom.us/webinar/2345678",
  },
  {
    nombre: "Ing. Carlos Reyes",
    rol: "Director de TI",
    fecha: "18:00 · 29 Oct",
    titulo: "Mantenimiento de Servidores Programado",
    mensaje:
      "La plataforma estará inactiva por mantenimiento el domingo 5 de noviembre de 01:00 AM a 06:00 AM. Agradecemos su comprensión.",
    linkConectate: "https://estatus.servidores.uni.com",
  },
];

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
      <div className=" rounded-xl md:m-5 m-2 md:pt-5 pt- p-5 bg-gray-100 mt-6  dark:bg-gray-800 min-h-screen">
        {mockedPosts.map((post, index) => (
          <CardMensaje
            key={index}
            {...post}
            // Esto asegurará que al menos un mensaje se renderice si no se usa el mockedPosts
            // nombre="Nayeil Arias"
            // rol="Maestra"
            // fecha="13 Nov 11:20"
            // titulo="¡Bienvenido, esta será nuestra primera clase!"
            // mensaje="Asegúrate de conectarte a este dewegvfguwedvugewuwefhwfbe hfbe edfefefefefefefffe wjhf..."
          />
        ))}
      </div>
    </div>
  );
};
export default Cohorte;
