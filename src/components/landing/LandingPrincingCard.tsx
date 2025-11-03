"use client";

import React from "react";

export interface PricingFeature {
  text: string;
  limited?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  price: number | "Gratis";
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

const PricingCard: React.FC<PricingCardProps> = ({plan}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-8 ${plan.borderColor} bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
    >
      {plan.popular && (
        <div className="absolute top-5 -right-8 bg-green-500 text-white px-10 py-1 rotate-45 text-xs font-semibold uppercase shadow-md">
          Popular
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
        className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${plan.buttonColor}`}
      >
        {plan.buttonText}
      </button>
    </div>
  );
};

export default PricingCard;
