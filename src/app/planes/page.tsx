// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { api } from '@/services/api';
// import { tokenStore } from '@/services/tokenStore';

// interface plan {
//   id: string;
//   name: string;
//   price: number;
//   description: string;
//   features?: string[];
// }

// interface Props {
//   plan: plan;
// }

// export default function PricingCard({ plan }: Props) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const handleSubscribe = async () => {
//     const token = tokenStore.getAccess();

//     if (!token) {
//       router.push('/login');
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await api.post('/payment/create-preference', { planId: plan.id });
//       const { init_point } = res.data;

//       // Redirige a Mercado Pago
//       window.location.href = init_point;
//     } catch (err) {
//       console.error('Error al crear la preferencia de pago:', err);
//       alert('No se pudo iniciar el pago. Intenta nuevamente.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col justify-between">
//       <div>
//         <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
//         <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
//         <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
//           ${plan.price}
//           <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mes</span>
//         </p>
//         <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-8">
//           {plan.features?.map((feature, idx) => (
//             <li key={idx} className="flex items-center">
//               <span className="mr-2 text-yellow-400">✓</span> {feature}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <button
//         onClick={handleSubscribe}
//         disabled={loading}
//         className={`mt-auto w-full py-3 rounded-xl font-semibold transition ${
//           loading
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
//         }`}
//       >
//         {loading ? 'Redirigiendo...' : 'Suscribirme'}
//       </button>
//     </div>
//   );
// }

export default function Page() {
  return <div>Planes Page</div>;
}