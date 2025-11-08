"use client";

import {motion} from "framer-motion";
import {BookMarked, ChevronDown, ChevronUp, ListTodo, Play, Link} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function LecturePage() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: "¿Qué es la programación?",
      content: `La programación es el arte de darle instrucciones a una computadora para que realice tareas específicas.
      A través de la programación, transformamos ideas en soluciones digitales: aplicaciones, videojuegos, sitios web y mucho más.`,
    },
    {
      title: "Pensamiento lógico y algoritmos",
      content: `Antes de escribir una sola línea de código, un programador debe pensar de forma lógica.
      Un algoritmo es un conjunto de pasos ordenados para resolver un problema.
      Aprender a pensar en términos de pasos y condiciones es el corazón de la programación.`,
    },
    {
      title: "Lenguajes y sintaxis",
      content: `Cada lenguaje tiene su forma particular de escribir instrucciones (su sintaxis), pero todos comparten estructuras comunes como variables, condiciones y bucles.
      Una buena base lógica te permitirá aprender cualquier lenguaje fácilmente.`,
    },
  ];

  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-800 overflow-hidden">
      {/* Encabezado con animación */}
      <motion.header
        initial={{opacity: 0, y: -40}}
        animate={{opacity: 1, y: 0}}
        transition={{ease: "easeOut", duration: 0.8}}
        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-10 shadow-md"
      >
        <div className="max-w-5xl mx-auto px-4 text-center ">
          <h1 className="text-4xl font-extrabold tracking-tight">L01 | Introducción a la Programación</h1>
          <p className="mt-3 text-indigo-100 text-lg">Conceptos básicos y fundamentos de la lógica de programación</p>
        </div>
      </motion.header>

      <main className="max-w-full mx-auto px-6 py-10 space-y-16 ">
        {/* Introducción */}
        <motion.section
          initial={{opacity: 0, y: 40}}
          whileInView={{opacity: 1, y: 0}}
          transition={{ease: "easeOut", duration: 0.8}}
          viewport={{once: true}}
          className="relative bg-white  dark:bg-gray-200 shadow-xl rounded-3xl p-8 overflow-hidden"
        >
          <motion.div
            animate={{y: [0, -10, 0]}}
            transition={{repeat: Infinity, duration: 5, ease: "easeInOut"}}
            className="absolute -top-10 -right-10 opacity-20"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1055/1055646.png"
              alt="Introducción a la programación"
              className="rounded-xl mt-5 w-full max-w-xl mx-auto animate-float"
              loading="lazy"
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-sky-700 mb-4 flex items-center gap-2">
            <BookMarked /> Introducción
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            La programación es una habilidad esencial en la era digital. Nos permite crear desde simples calculadoras
            hasta complejas redes sociales. A través del pensamiento lógico, aprenderás a resolver problemas de forma
            estructurada y eficiente.
          </p>
          <p className="mt-4 text-gray-700 text-lg">
            En esta clase aprenderás los fundamentos que te abrirán las puertas a cualquier lenguaje de programación. 💻
          </p>
        </motion.section>

        {/* Video */}
        <motion.section
          initial={{opacity: 0, scale: 0.9}}
          whileInView={{opacity: 1, scale: 1}}
          transition={{ease: "easeOut", duration: 0.8}}
          viewport={{once: true}}
          className="bg-white  dark:bg-gray-200 rounded-3xl p-8 shadow-xl text-center"
        >
          <h2 className="text-2xl font-bold text-sky-700 mb-4 flex justify-center items-center gap-2">
            <Play /> Video: ¿Qué es programar?
          </h2>
          <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden shadow-md">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/zOjov-2OZ0E"
              title="Introducción a la programación"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-gray-600 mt-3 text-sm">
            Fuente: FreeCodeCamp Español — *Introducción a la Programación para Principiantes*
          </p>
        </motion.section>

        {/* Conceptos clave */}
        <motion.section
          initial={{opacity: 0, y: 40}}
          whileInView={{opacity: 1, y: 0}}
          transition={{ease: "easeOut", duration: 0.7}}
          viewport={{once: true}}
          className="bg-white rounded-3xl  dark:bg-gray-200 p-8 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-sky-700 mb-6 flex items-center gap-2">📘 Conceptos clave</h2>
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{delay: i * 0.2, duration: 0.5, ease: "easeOut"}}
              className="mb-3 border border-gray-200 rounded-xl bg-slate-50 overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-indigo-50"
                onClick={() => toggleSection(i)}
              >
                {section.title}
                {openSection === i ? <ChevronUp /> : <ChevronDown />}
              </button>
              {openSection === i && (
                <motion.div
                  initial={{height: 0, opacity: 0}}
                  animate={{height: "auto", opacity: 1}}
                  transition={{ease: "easeOut", duration: 0.4}}
                  className="px-5 pb-4 text-gray-600 text-sm"
                >
                  {section.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.section>

        {/* Bloque de código */}
        <motion.section
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          transition={{ease: "easeOut", duration: 0.7}}
          viewport={{once: true}}
          className="bg-gray-900  dark:bg-gray-200 dark:text-black text-gray-100 rounded-2xl p-6 shadow-lg font-mono"
        >
          <h2 className="text-xl font-semibold text-green-400 mb-4">💻 Ejemplo de algoritmo</h2>
          <pre className="text-sm leading-relaxed overflow-x-auto">
            {`// Algoritmo: Comparar dos números
INICIO
  ESCRIBIR "Ingrese el primer número"
  LEER num1
  ESCRIBIR "Ingrese el segundo número"
  LEER num2

  SI num1 > num2 ENTONCES
    ESCRIBIR "El número mayor es: ", num1
  SINO
    ESCRIBIR "El número mayor es: ", num2
  FIN SI
FIN`}
          </pre>
        </motion.section>

        {/* Tarea */}
        <motion.section
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          transition={{delay: 0.3, duration: 0.8, ease: "easeOut"}}
          viewport={{once: true}}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border  dark:bg-gray-200 border-indigo-200 rounded-3xl p-8 shadow-sm"
        >
          <h2 className="text-3xl font-semibold text-sky-700 mb-4 flex items-center gap-2">
            <ListTodo /> Tarea: ¡Pon a prueba tu lógica!
          </h2>
          <p className="text-gray-700 mb-3">
            Diseña un algoritmo que pida tres números e indique cuál es el mayor de los tres.
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
            <li>Utiliza estructuras condicionales anidadas.</li>
            <li>Comenta cada línea de tu algoritmo.</li>
            <li>Incluye una verificación para el caso de que sean iguales.</li>
          </ul>
        </motion.section>

        {/* Referencias */}
        <motion.section
          initial={{opacity: 0}}
          whileInView={{opacity: 1}}
          transition={{ease: "easeInOut", duration: 1}}
          className="bg-white  dark:bg-gray-200 rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-sky-700 mb-4 flex items-center gap-2">
            <Link /> Referencias
          </h2>
          <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
            <li>
              <a
                href="https://www.freecodecamp.org/espanol/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                FreeCodeCamp Español — Introducción a la programación
              </a>
            </li>
            <li>
              <a
                href="https://developer.mozilla.org/es/docs/Learn/JavaScript"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                MDN Web Docs — Aprende los fundamentos de JavaScript
              </a>
            </li>
            <li>
              <a
                href="https://youtu.be/zOjov-2OZ0E"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                YouTube — What is Programming? (Computer Science Crash Course)
              </a>
            </li>
          </ul>
        </motion.section>
        <button
          onClick={() => router.push("/cohorte?tab=Lecturas")}
          className="flex items-center justify-center gap-2 mx-auto mt-10 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out"
        >
          ← Volver a Lecturas
        </button>
      </main>
    </div>
  );
}
