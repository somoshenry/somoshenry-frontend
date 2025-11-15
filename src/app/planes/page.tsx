"use client";

import PricingCard from "@/components/planes/PlansCard";
import { pricingPlans } from "@/components/landing/dataPlans";
import { useAuth } from "@/hook/useAuth";
import { usePlanBenefits } from "@/hook/usePlanBenefits";
import { usePost } from "@/context/PostContext";

export default function PlansPage() {
  const { user } = useAuth();
  const { maxMonthlyPosts, plan } = usePlanBenefits();
  const { posts } = usePost();

  // Calcular cuantos posteos lleva en el mes actual
  const getMonthlyPostsCount = () => {
    const now = new Date();
    return posts.filter((p) => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  };

  const usedPosts = getMonthlyPostsCount();
  const remainingPosts = maxMonthlyPosts === Infinity ? "∞" : maxMonthlyPosts - usedPosts;

  // Fecha de renovación: primer día del mes siguiente
  const renewalDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });
  };

  // Ocultar el plan actual
  const filteredPlans = pricingPlans.filter((p) => p.badge.toUpperCase() !== plan);

  return (
    <div className="md:ml-64 pt-16">
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ====================== TÍTULO ====================== */}
          <h2 className="text-4xl font-bold text-center mb-5 text-gray-900 dark:text-white">
            Planes de Suscripción
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-16">
            Elige el plan que mejor se adapte a tus necesidades
          </p>

          {/* ====================== SI YA TIENE UN PLAN ====================== */}
          {user?.subscription && (
            <div className="mb-16 max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tu plan actual:{" "}
                <span className="uppercase">
                  {user.subscription}
                </span>
              </h3>

              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Posteos usados este mes:{" "}
                <strong>
                  {usedPosts} / {maxMonthlyPosts === Infinity ? "∞" : maxMonthlyPosts}
                </strong>
              </p>

              {/* Barra de progreso */}
              {maxMonthlyPosts !== Infinity && (
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden mb-4">
                  <div
                    className="bg-yellow-400 h-full transition-all"
                    style={{
                      width: `${(usedPosts / maxMonthlyPosts) * 100}%`,
                    }}
                  ></div>
                </div>
              )}

              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Posteos restantes:{" "}
                <strong>{remainingPosts}</strong>
              </p>

              <p className="text-gray-700 dark:text-gray-300">
                Tu plan se renueva el:{" "}
                <strong>{renewalDate()}</strong>
              </p>

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Puedes cambiar tu plan en cualquier momento
                </span>
              </div>
            </div>
          )}

          {/* ====================== LISTA DE PLANES ====================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filteredPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
