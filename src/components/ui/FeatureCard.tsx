import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="w-12 h-12 bg-[#FFFF00] rounded-md flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-black dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
