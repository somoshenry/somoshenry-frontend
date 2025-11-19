"use client";

import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {tokenStore} from "@/services/tokenStore";
import Swal from "sweetalert2";
import {useAuth} from "@/hook/useAuth";
import {pricingPlans} from "@/components/landing/dataPlans";
import {getMySubscription} from "@/services/subscriptionService";

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
  isCurrentPlan?: boolean;
  onUpgrade: (plan: PricingPlan) => void;
}

interface SubscriptionData {
  plan: "BRONCE" | "PLATA" | "ORO";
  expiresAt: string | null;
  postsRemaining: number;
  postsLimit: number;
}

const PricingCard: React.FC<PricingCardProps> = ({plan, isCurrentPlan, onUpgrade}) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    await onUpgrade(plan);
    setLoading(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-8 ${
        plan.borderColor
      } bg-white dark:bg-gray-800 transition-all duration-300
    ${isCurrentPlan ? "" : "shadow-lg hover:shadow-2xl transform hover:scale-105"}`}
      style={
        isCurrentPlan ? {boxShadow: "0 0 5px 5px rgba(59, 130, 246, 1), 0 0 20px 10px rgba(59, 130, 246, .7)"} : {}
      }
    >
      {plan.popular && !isCurrentPlan && (
        <div className="absolute top-5 -right-8 bg-green-500 text-white px-10 py-1 rotate-45 text-xs font-semibold uppercase shadow-md">
          Popular
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-5 -right-8 bg-blue-500 text-white px-10 py-1 rotate-45 text-xs font-semibold uppercase shadow-md">
          Actual
        </div>
      )}

      <span
        className={`inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase mb-5 shadow-sm ${plan.badgeColor}`}
      >
        {plan.badge}
      </span>

      <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{plan.name}</h3>

      <div className="text-5xl font-bold mb-3 text-gray-900 dark:text-white">
        {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
        {plan.currency && (
          <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">{plan.currency}</span>
        )}
      </div>

      <ul className="my-8 space-y-2">
        {plan.features.map((feature, index) => (
          <li
            key={index}
            className="py-2 border-b border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm flex items-center"
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                feature.limited ? "bg-orange-100 dark:bg-orange-900" : "bg-green-100 dark:bg-green-900"
              }`}
            >
              <span
                className={`text-sm ${
                  feature.limited ? "text-orange-500 dark:text-orange-400" : "text-green-500 dark:text-green-400"
                }`}
              >
                {feature.limited ? "⚠" : "✓"}
              </span>
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-4 rounded-lg cursor-pointer font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
          isCurrentPlan ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : plan.buttonColor
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loading ? "Redirigiendo..." : isCurrentPlan ? "Plan Actual" : plan.buttonText}
      </button>
    </div>
  );
};

export default function PlanesPage() {
  const router = useRouter();
  const {user} = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const data = await getMySubscription();
      setSubscriptionData(data);
    } catch (error) {
      console.error("Error al cargar suscripción:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: PricingPlan) => {
    const token = tokenStore.getAccess();

    if (!token) {
      router.push("/login");
      return;
    }

    if (plan.id === "free") {
      await Swal.fire({
        title: "Plan Gratuito",
        text: "El plan gratuito está disponible para todos los usuarios.",
        icon: "info",
      });
      return;
    }

    try {
      const clientEmail = user?.email || "test_user@test.com";
      const userId = user?.id;

      const planNameMap: Record<string, string> = {
        free: "BRONCE",
        level1: "PLATA",
        level2: "ORO",
      };

      const planName = planNameMap[plan.id] || plan.name;

      const res = await fetch("https://somoshenry-backend.onrender.com/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          clientEmail,
          products: [
            {
              title: planName,
              quantity: 1,
              price: typeof plan.price === "number" ? plan.price : 0,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          title: "No se pudo crear la preferencia de pago.",
          text: data?.message || "Intenta nuevamente más tarde.",
          icon: "error",
        });
        return;
      }

      const initPoint = data.initPoint || data.init_point || data?.preference?.init_point || data?.body?.init_point;

      if (!initPoint) {
        Swal.fire({
          title: "No se recibió la URL de pago.",
          text: "Revisa la respuesta del backend (initPoint / init_point).",
          icon: "error",
        });
        return;
      }

      window.location.href = initPoint;
    } catch (err) {
      console.error("Error al crear la preferencia de pago:", err);
      Swal.fire({
        title: "Hubo un problema al iniciar el pago. Intenta nuevamente.",
        icon: "error",
      });
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "BRONCE":
        return {text: "Bronce", color: "bg-amber-700 text-white"};
      case "PLATA":
        return {text: "Plata", color: "bg-gray-400 text-white"};
      case "ORO":
        return {text: "Oro", color: "bg-yellow-400 text-black"};
      default:
        return {text: "Sin Plan", color: "bg-gray-500 text-white"};
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin vencimiento";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {year: "numeric", month: "long", day: "numeric"});
  };

  const getCurrentPlanId = () => {
    if (!subscriptionData) return null;
    switch (subscriptionData.plan) {
      case "BRONCE":
        return "free";
      case "PLATA":
        return "level1";
      case "ORO":
        return "level2";
      default:
        return null;
    }
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="max-w-7xl ml-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlanId = getCurrentPlanId();
  const daysRemaining = getDaysRemaining(subscriptionData?.expiresAt || null);
  const planBadge = subscriptionData ? getPlanBadge(subscriptionData.plan) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className=" md:ml-66 mt-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Gestión de Suscripción</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Administra tu plan y visualiza tu estado actual</p>
        </div>

        {subscriptionData && (
          <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tu Suscripción Actual</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Tipo de Plan
                  </h3>
                  <svg
                    className="w-6 h-6 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                {planBadge && (
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${planBadge.color} shadow-md`}
                  >
                    {planBadge.text}
                  </span>
                )}
              </div>

              <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Fecha de Expiración
                  </h3>
                  <svg
                    className="w-6 h-6 text-green-500 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatDate(subscriptionData.expiresAt)}
                </p>
                {daysRemaining !== null && (
                  <p
                    className={`text-sm font-medium ${
                      daysRemaining <= 7 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {daysRemaining > 0 ? `${daysRemaining} días restantes` : "Expirado"}
                  </p>
                )}
              </div>

              <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Posteos Restantes
                  </h3>
                  <svg
                    className="w-6 h-6 text-purple-500 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {subscriptionData.postsRemaining === -1 ? "∞" : subscriptionData.postsRemaining}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  de {subscriptionData.postsLimit === -1 ? "ilimitados" : subscriptionData.postsLimit}
                </p>
                <div className="mt-3 bg-white dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      subscriptionData.postsRemaining === -1
                        ? "bg-purple-500 w-full"
                        : subscriptionData.postsRemaining / subscriptionData.postsLimit > 0.5
                        ? "bg-green-500"
                        : subscriptionData.postsRemaining / subscriptionData.postsLimit > 0.2
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width:
                        subscriptionData.postsRemaining === -1
                          ? "100%"
                          : `${Math.max(5, (subscriptionData.postsRemaining / subscriptionData.postsLimit) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Cambiar Plan</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Actualiza tu suscripción para acceder a más beneficios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
