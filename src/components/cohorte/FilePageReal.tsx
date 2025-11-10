// En: /components/cohorte/FilePageReal.tsx

import IFileCardProps from "@/interfaces/cohorte/IFileCardProps";
import {useState, ChangeEvent, Dispatch, SetStateAction} from "react";
import ImputGeneric from "../login/register/ImputGeneric";
import {mapMimeToCategory} from "@/utils/file-mappers";
import {X} from "lucide-react";

// Interfaz para las props que recibiremos del componente padre (FilePage.tsx)
interface FilePageRealProps {
  setFilesList: Dispatch<SetStateAction<IFileCardProps[]>>;
}

const FilePageReal: React.FC<FilePageRealProps> = ({setFilesList}) => {
  // Define el estado inicial completo para reutilizar
  const INITIAL_STATE: IFileCardProps = {
    name: "",
    description: "",
    type: "",
    uploadedAt: "",
    url: "",
  };

  const [fileUp, setFileUp] = useState<IFileCardProps>(INITIAL_STATE);

  // ************* FUNCIÓN DE BORRADO *************
  const handleDeleteFile = () => {
    // Usa el estado inicial para restablecer todos los campos del formulario
    setFileUp(INITIAL_STATE);
  };
  // **********************************************

  // Maneja cambios en los inputs de texto (Título y Descripción)
  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFileUp({...fileUp, [name]: value});
  };

  // FUNCIÓN MODIFICADA: Ahora usa setFilesList de las props para guardar
  const handleSaveFile = () => {
    if (fileUp.type && fileUp.name) {
      // Agregar el archivo actual a la lista global usando el setter del padre
      setFilesList((prevList) => [...prevList, fileUp]);

      // Resetear el estado de subida local
      handleDeleteFile();
    } else {
      alert("Por favor, selecciona un archivo y asigna un título antes de guardar.");
    }
  };

  // Maneja la selección del archivo <input type="file">
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (selectedFile) {
      setFileUp((prev) => ({
        ...prev,
        name: prev.name || selectedFile.name,
        type: selectedFile.type, // Tipo MIME
        uploadedAt: now.toLocaleDateString("es-ES", options),
        url: `/uploads/${selectedFile.name.replace(/\s/g, "-")}-${Date.now()}`, // URL simulada
      }));
    } else {
      setFileUp((prev) => ({...prev, type: ""}));
    }
  };

  // Retorna el icono basado en la categoría del archivo
  const getFileIcon = () => {
    const fileCategory = mapMimeToCategory(fileUp.type);
    switch (fileCategory) {
      case "doc":
        return <img src="./doc.png" className="size-36" alt="Documento" />;
      case "video":
        return <img src="./movie.png" className="size-36" alt="Video" />;
      case "image":
        return <img src="./img.png" className="size-36" alt="Imagen" />;
      case "code":
        return <img src="./code.png" className="size-36" alt="Código" />;
      case "folder":
        return <img src="./folder.png" className="size-36" alt="Carpeta" />;
      default:
        return <img src="./default.png" className="size-36" alt="Archivo" />;
    }
  };

  const baseClasses = "rounded-lg text-xs pl-4 py-2 transition-colors duration-300";
  const conditionalColor = fileUp.type ? "bg-[#ffff00] text-black" : "bg-gray-200 text-black";

  return (
    // 💡 AÑADIDO: 'relative' para posicionar la 'X' de forma absoluta
    <div className="p-3 rounded-xl dark:bg-gray-200 bg-white w-full dark:outline-[#ffff00] dark:outline-2 shadow-gray-600 shadow-sm/30 border relative">
      {fileUp.type ? (
        // Contenido cuando hay archivo seleccionado
        <>
          {/* 💡 BOTÓN DE BORRADO REUBICADO y POSICIONADO ABSOLUTAMENTE */}
          <button
            type="button"
            className="bg-red-500 p-1 text-white rounded hover:bg-red-600 transition-colors duration-200 absolute top-2 right-2 z-10"
            onClick={handleDeleteFile}
            aria-label="Borrar archivo seleccionado"
          >
            <X className="size-5" />
          </button>

          <div className="flex flex-col md:flex-row w-full ">
            <div className="mr-4 md:w-[80%] w-full">
              <ImputGeneric
                id="name"
                label="Titulo"
                type="text"
                value={fileUp.name}
                name="name"
                onChange={changeHandler}
              />
              <ImputGeneric
                id="description"
                label="Descripcion"
                type="text"
                value={fileUp.description}
                name="description"
                onChange={changeHandler}
              />

              <div className="flex items-center md:justify-start justify-center text-black mt-3">
                <input type="file" onChange={handleFileChange} className={`${baseClasses} ${conditionalColor}`} />

                {/* BOTÓN DE BORRADO ANTERIOR ELIMINADO */}

                {/* BOTÓN GUARDAR: Llama a handleSaveFile */}
                <button
                  type="button"
                  className="bg-gray-200 text-black hover:scale-105 dark:bg-gray-800 dark:text-white duration-150 ease-in cursor-pointer rounded-lg md:mr-3 text-xs px-4 py-2 ml-3"
                  onClick={handleSaveFile}
                >
                  Subir Archivo
                </button>
              </div>
            </div>
            {/* PREVISUALIZACIÓN */}
            <div className="md:w-[20%] flex items-center justify-center mt-3 md:mt-0">{getFileIcon()}</div>
          </div>
        </>
      ) : (
        // Contenido inicial (sin archivo)
        <>
          <ImputGeneric id="name" label="Titulo" type="text" value={fileUp.name} name="name" onChange={changeHandler} />
          <ImputGeneric
            id="description"
            label="Descripcion"
            type="text"
            value={fileUp.description}
            name="description"
            onChange={changeHandler}
          />
          <div className="flex items-center mt-3">
            <label className="mb-2 font-medium text-black md:mr-3">Subir archivo</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="bg-gray-200 text-black hover:scale-105 dark:bg-gray-900 dark:text-white duration-150 ease-in cursor-pointer rounded-lg md:mr-3 text-xs pl-4 py-2"
            />
          </div>
        </>
      )}

      {fileUp.type && <p className="mt-2 text-sm text-center md:text-start text-green-700">Tipo: *{fileUp.type}*</p>}
    </div>
  );
};

export default FilePageReal;
