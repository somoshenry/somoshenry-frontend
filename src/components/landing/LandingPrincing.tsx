'use client';

import React from 'react';
import PricingCard, { PricingPlan } from './LandingPrincingCard';

// Datos de los planes
const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Bronce',
    badgeColor: 'bg-amber-700 text-white',
    price: 'Gratis',
    features: [{ text: 'Máximo 10 posteos mensuales', limited: true }, { text: 'Sin prioridad en el muro', limited: true }, { text: 'Acceso a la comunidad' }, { text: 'Perfil básico' }, { text: 'Mensajería básica' }],
    buttonText: 'Comenzar Gratis',
    buttonColor: 'bg-amber-700 hover:bg-amber-800 text-white',
    borderColor: 'border-t-4 border-amber-700',
  },
  {
    id: 'level1',
    name: 'Nivel 1',
    badge: 'Plata',
    badgeColor: 'bg-gray-400 text-white',
    price: 5,
    currency: 'USD/mes',
    features: [{ text: 'Hasta 50 publicaciones al mes' }, { text: 'Prioridad media en el muro' }, { text: 'Acceso a eventos exclusivos' }, { text: 'Perfil destacado' }, { text: 'Soporte prioritario' }, { text: 'Sin anuncios' }],
    buttonText: 'Suscribirse',
    buttonColor: 'bg-gray-400 hover:bg-gray-500 text-white',
    borderColor: 'border-t-4 border-gray-400',
  },
  {
    id: 'level2',
    name: 'Nivel 2',
    badge: 'Oro',
    badgeColor: 'bg-yellow-400 text-black',
    price: 10,
    currency: 'USD/mes',
    features: [{ text: 'Publicaciones ilimitadas' }, { text: 'Máxima prioridad en el muro' }, { text: 'Acceso VIP a todos los eventos' }, { text: 'Perfil premium destacado' }, { text: 'Soporte 24/7 prioritario' }, { text: 'Insignia exclusiva' }, { text: 'Acceso anticipado a nuevas funciones' }, { text: 'Análisis de engagement' }],
    buttonText: 'Suscribirse Ahora',
    buttonColor: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    borderColor: 'border-t-4 border-yellow-400',
    popular: true,
  },
];

const LandingPricing: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-5 text-gray-900 dark:text-white">Planes de Suscripción</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-16">Elige el plan que mejor se adapte a tus necesidades</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
