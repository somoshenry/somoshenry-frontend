import { useAuth } from "./useAuth";
import { SubscriptionPlan } from "@/interfaces/context/auth";

export const usePlanBenefits = () => {
  const { user } = useAuth();

  // Obtener el plan: si subscription es un objeto, extraer el plan; sino usar BRONCE como default
  const getPlan = (): SubscriptionPlan => {
    if (!user?.subscription) return "BRONCE";
    if (typeof user.subscription === 'object' && 'plan' in user.subscription) {
      return user.subscription.plan;
    }
    return "BRONCE";
  };

  const plan = getPlan();

  const limits: Record<SubscriptionPlan, number> = {
    BRONCE: 10,
    PLATA: 50,
    ORO: Infinity,
  };

  return {
    plan,
    maxMonthlyPosts: limits[plan],
    isUnlimited: limits[plan] === Infinity,
    isBronce: plan === "BRONCE",
    isPlata: plan === "PLATA",
    isOro: plan === "ORO",
  };
};
