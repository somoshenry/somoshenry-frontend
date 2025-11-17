'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hook/useAuth';

interface StatusInfo {
  title: string;
  message: string;
  color: string;
}

export default function SubscriptionRedirectClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Para refrescar el usuario cuando el pago se apueba
  const { refreshUser } = useAuth();

  const [localStatus, setLocalStatus] = useState<string | null>(() => {
    const urlStatus = searchParams.get('collection_status') || searchParams.get('status');
    if (urlStatus) {
      try {
        sessionStorage.setItem('lastPaymentStatus', urlStatus);
      } catch {}
      return urlStatus;
    }
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lastPaymentStatus') : null;
    return stored || null;
  });

  const status = localStatus === null || localStatus === 'unknown' ? 'checking' : localStatus;

  useEffect(() => {
    const validatePayment = async () => {
      const currentStatus = searchParams.get('collection_status') || searchParams.get('status');

      if (currentStatus) {
        try {
          sessionStorage.setItem('lastPaymentStatus', currentStatus);
        } catch {}
        setLocalStatus(currentStatus);
      }

      const paymentId = searchParams.get('payment_id');
      const token = localStorage.getItem('access_token');

      // si el pago fue aprobado, refrescar el usuario
      if (currentStatus === 'approved' || currentStatus === 'success') {
        refreshUser(); // actualiza plan + fecha de vencimiento
      }

      if (paymentId && currentStatus) {
        try {
          await fetch('https://somoshenry-backend.onrender.com/mercadopago/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: { id: paymentId },
              type: 'payment',
              action: 'payment.updated',
            }),
          });

          // limpia la URL
          if (searchParams.toString()) {
            try {
              router.replace(pathname, { scroll: false });
            } catch {
              router.replace('/redirect', { scroll: false });
            }
          }
        } catch (error) {
          console.error('Error sending payment validation:', error);
        }
      }
    };

    validatePayment();
  }, [searchParams, router, pathname, refreshUser]);

  const getStatusMessage = (): StatusInfo => {
    switch (status) {
      case 'approved':
      case 'success':
        return {
          title: '¡Suscripción aprobada! 🎉',
          message: 'Tu suscripción se activó correctamente. Ya podés disfrutar de todos los beneficios.',
          color: 'bg-green-100 text-green-800 border-green-400',
        };
      case 'pending':
        return {
          title: 'Suscripción pendiente ⏳',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-400',
        };
      case 'rejected':
      case 'failure':
        return {
          title: 'Pago rechazado ❌',
          message: 'Tu pago no pudo completarse. Probá nuevamente o elegí otro método de pago.',
          color: 'bg-red-100 text-red-800 border-red-400',
        };
      default:
        return {
          title: 'Verificando pago...',
          message: 'Por favor, esperá unos segundos ⏳',
          color: 'bg-gray-100 text-gray-700 border-gray-300',
        };
    }
  };

  const info = getStatusMessage();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full border rounded-2xl shadow p-8 text-center ${info.color}`}
      >
        <h1 className="text-2xl font-bold mb-4">{info.title}</h1>
        <p className="mb-6">{info.message}</p>

        <button onClick={() => router.push('/home')} className="mt-4 bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition">
          Volver al inicio
        </button>
      </motion.div>
    </main>
  );
}
