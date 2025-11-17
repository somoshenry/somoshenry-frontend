'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStore } from '@/services/tokenStore';
import Swal from 'sweetalert2';
import { useAuth } from '@/hook/useAuth';
import { pricingPlans } from '@/components/landing/dataPlans';

export interface PricingFeature {
  text: string;
  limited?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  price: number | string;
  currency?: string;
  features: PricingFeature[];
  buttonText: string;
  buttonColor: string;
  borderColor: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async () => {
    const token = tokenStore.getAccess();

    if (!token) {
      router.push('/login');
      return;
    }

    // Plan free: no ir a MP
    if (plan.id === 'free') {
      router.push('/register');
      return;
    }

    try {
      setLoading(true);

      const clientEmail = user?.email || 'test_user@test.com';
      const userId = user?.id;

      const res = await fetch('https://somoshenry-backend.onrender.com/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId, // 🔥 mandamos el userId
          clientEmail,
          products: [
            {
              title: plan.name,
              quantity: 1,
              price: typeof plan.price === 'number' ? plan.price : 0,
            },
          ],
        }),
      });

      const data = await res.json();
      console.log('Respuesta MP:', data);

      if (!res.ok) {
        Swal.fire({
          title: 'No se pudo crear la preferencia de pago.',
          text: data?.message || 'Intenta nuevamente más tarde.',
          icon: 'error',
        });
        return;
      }

      // Soportar distintas formas de devolver el init_point
      const initPoint = data.initPoint || data.init_point || data?.preference?.init_point || data?.body?.init_point;

      if (!initPoint) {
        Swal.fire({
          title: 'No se recibió la URL de pago.',
          text: 'Revisa la respuesta del backend (initPoint / init_point).',
          icon: 'error',
        });
        return;
      }

      window.location.href = initPoint;
    } catch (err) {
      console.error('Error al crear la preferencia de pago:', err);
      Swal.fire({
        title: 'Hubo un problema al iniciar el pago. Intenta nuevamente.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-8 ${plan.borderColor} bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
    >
      {plan.popular && (
        <div className="absolute top-5 -right-8 bg-green-500 text-white px-10 py-1 rotate-45 text-xs font-semibold uppercase shadow-md">Popular</div>
      )}

      <span className={`inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase mb-5 shadow-sm ${plan.badgeColor}`}>{plan.badge}</span>

      <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{plan.name}</h3>

      <div className="text-5xl font-bold mb-3 text-gray-900 dark:text-white">
        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
        {plan.currency && <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">{plan.currency}</span>}
      </div>

      <ul className="my-8 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="py-2 border-b border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm flex items-center">
            <span
              className={`shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                feature.limited ? 'bg-orange-100 dark:bg-orange-900' : 'bg-green-100 dark:bg-green-900'
              }`}
            >
              <span className={`text-sm ${feature.limited ? 'text-orange-500 dark:text-orange-400' : 'text-green-500 dark:text-green-400'}`}>
                {feature.limited ? '⚠' : '✓'}
              </span>
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-4 rounded-lg cursor-pointer font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
          plan.buttonColor
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Redirigiendo...' : plan.buttonText}
      </button>
    </div>
  );
};

// Componente de página principal
export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Elige tu Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Selecciona el plan que mejor se adapte a tus necesidades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
