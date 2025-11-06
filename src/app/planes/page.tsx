'use client';

import PricingCard from '@/components/planes/PlansCard';
import { pricingPlans } from '@/components/landing/dataPlans';

export default function PlansPage() {
  return (
    <div className="md:ml-64 pt-16">
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-5 text-gray-900 dark:text-white">
            Planes de Suscripción
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-16">
            Elige el plan que mejor se adapte a tus necesidades
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
