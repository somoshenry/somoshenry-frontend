interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
      <div className="w-14 h-14 bg-[#FFFF00] rounded-lg flex items-center justify-center mb-5 shadow-md transform group-hover:scale-110 transition-all duration-300">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
