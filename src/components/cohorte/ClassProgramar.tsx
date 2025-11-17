import {useState} from "react";
import ImputGeneric from "../login/register/ImputGeneric";

export interface cardDataProps {
  date: string;
  time: string;
  linkclace: string;
  title: string;
  description: string;
  fechaClass: string;
  theme: "hang" | "sub";
}
export interface UserInfo {
  loggedName: string;
  loggedRol: string;
}
interface ClassProgramarProps {
  onDataUpdate: (data: cardDataProps & UserInfo) => void;
  sectionTheme: "hang" | "sub";
  currentUser: UserInfo;
}

const INITIAL_FORM_DATA: cardDataProps = {
  date: "",
  time: "",
  linkclace: "",
  title: "",
  description: "",
  fechaClass: "",
  theme: "hang", // O el valor que corresponda a sectionTheme
};

const ClassProgramar: React.FC<ClassProgramarProps> = ({onDataUpdate, sectionTheme, currentUser}) => {
  const [datetime, setdatetime] = useState<cardDataProps>({
    ...INITIAL_FORM_DATA,
    theme: sectionTheme,
  });

  const id = "description";
  const label = "Descripción";

  const baseClasses =
    "bg-gray-100 w-full rounded-lg px-3 py-2 text-sm text-black focus:outline-[#ffff00] focus:duration-150 ease-in";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;

    const updatedData = {...datetime, [name]: value};
    setdatetime(updatedData);
  };

  const handleSubmit = () => {
    const finalData = datetime;

    onDataUpdate({
      ...finalData,
      loggedName: currentUser.loggedName,
      loggedRol: currentUser.loggedRol,
    });

    setdatetime({...INITIAL_FORM_DATA, theme: sectionTheme});

    console.log("Datos listos para enviar:", finalData);
  };
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div
      className="p-4 bg-gray-200 rounded-xl
    shadow-2xl/10 h-fit shadow-black w-[300px] mt-3.5"
    >
      <h2 className="text-black font-bold dark:font-bold">Agendar clase</h2>
      <ImputGeneric
        id="date"
        label="Fecha"
        type="date"
        value={datetime.date}
        name="date"
        onChange={handleChange}
        min={hoy}
      />

      <ImputGeneric
        id="time"
        label="Horario"
        type="time"
        value={datetime.time}
        name="time"
        min="08:00"
        max="17:00"
        onChange={handleChange}
      />

      <ImputGeneric
        id="title"
        label="Título de la Clase"
        type="text"
        value={datetime.title}
        name="title"
        onChange={handleChange}
      />

      <label htmlFor={id} className="font-text text-black text-lg">
        {label}
      </label>
      <textarea
        id="description"
        name="description"
        value={datetime.description}
        onChange={handleChange}
        rows={3}
        placeholder="Escribe la descripción de la clase aquí..."
        className={`
            ${baseClasses} 
            resize-y 
            h-20 
            overflow-y-auto 
            p-3
          `}
      />

      <ImputGeneric
        id="linkclace"
        label="Ruta"
        value={datetime.linkclace}
        type="url"
        name="linkclace"
        onChange={handleChange}
      />
      <button
        className=" mx-auto mt-3 bg-[#ffff00] dark:bg-gray-800 hover:scale-105 duration-150 ease-in dark:text-white text-black px-5 py-1 rounded-md font-medium cursor-pointer"
        onClick={handleSubmit}
      >
        Agendar
      </button>
    </div>
  );
};
export default ClassProgramar;
