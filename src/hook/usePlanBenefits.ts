import { useAuth } from "./useAuth";
import { SubscriptionPlan } from "@/interfaces/context/auth";

export const usePlanBenefits = () => {
  const { user } = useAuth();

  // 🔥 Cast explícito para evitar ANY
  const plan: SubscriptionPlan = user?.subscription ?? "BRONCE";

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
