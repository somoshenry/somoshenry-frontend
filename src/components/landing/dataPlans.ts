import {deflate} from "zlib";

export const pricingPlans = [
  {
    id: "free",
    name: "Free",
    badge: "Bronce",
    badgeColor: "bg-amber-700 text-white",
    price: "Gratis",
    features: [
      {text: "Máximo 10 posteos mensuales", limited: true},
      {text: "Sin prioridad en el muro", limited: true},
      {text: "Acceso a la comunidad"},
      {text: "Perfil básico"},
      {text: "Mensajería básica"},
    ],
    buttonText: "Comenzar Gratis",
    buttonColor: "bg-amber-700 hover:bg-amber-800 mt-39 text-white",
    borderColor: "border-t-4 border-amber-700 dark:border-amber-700",
  },
  {
    id: "level1",
    name: "Nivel 1",
    badge: "Plata",
    badgeColor: "bg-gray-400 text-white",
    price: 5,
    currency: "USD/mes",
    features: [
      {text: "Hasta 50 publicaciones al mes"},
      {text: "Prioridad media en el muro"},
      {text: "Acceso a eventos exclusivos"},
      {text: "Perfil destacado"},
      {text: "Soporte prioritario"},
      {text: "Sin anuncios"},
    ],
    buttonText: "Suscribirse Ahora",
    buttonColor: "bg-gray-400 hover:bg-gray-500 mt-27 text-white",
    borderColor: "border-t-4 border-gray-400 dark:border-gray-400",
  },
  {
    id: "level2",
    name: "Nivel 2",
    badge: "Oro",
    badgeColor: "bg-yellow-400 text-black",
    price: 10,
    currency: "USD/mes",
    features: [
      {text: "Publicaciones ilimitadas"},
      {text: "Máxima prioridad en el muro"},
      {text: "Acceso VIP a todos los eventos"},
      {text: "Perfil premium destacado"},
      {text: "Soporte 24/7 prioritario"},
      {text: "Insignia exclusiva"},
      {text: "Acceso anticipado a nuevas funciones"},
      {text: "Análisis de engagement"},
    ],
    buttonText: "Suscribirse Ahora",
    buttonColor: "bg-yellow-400 hover:bg-yellow-500 mt-4 text-black",
    borderColor: "border-t-4 border-yellow-400 dark:border-yellow-400",
    popular: true,
  },
];

export default pricingPlans;
