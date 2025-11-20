'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import CohorteDynamic from '@/components/cohorte/CohorteDynamic';
import { getCohorteById, Cohorte } from '@/services/cohorteService';
import { useAuth } from '@/hook/useAuth';

export default function CohorteDynamicPage() {
  const { cohorteId } = useParams() as { cohorteId: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cohorte, setCohorte] = useState<Cohorte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCohorte() {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const data = await getCohorteById(cohorteId);

        // Verificar si el usuario es miembro de la cohorte
        const isMember = data.members?.some((m) => m.user.id === user.id);

        if (!isMember && user.role !== 'ADMIN') {
          setError('No tienes acceso a esta cohorte');
          return;
        }

        setCohorte(data);
      } catch (err: any) {
        console.error('Error al cargar cohorte:', err);
        if (err.response?.status === 404) {
          setError('Cohorte no encontrada');
        } else if (err.response?.status === 403) {
          setError('No tienes permisos para ver esta cohorte');
        } else {
          setError('Error al cargar la cohorte');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCohorte();
  }, [cohorteId, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando cohorte...</p>
        </div>
      </div>
    );
  }

  if (error || !cohorte) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || 'Cohorte no encontrada'}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error === 'No tienes acceso a esta cohorte' ? 'Esta cohorte es privada. Solo los miembros pueden acceder.' : 'No pudimos cargar la información de esta cohorte.'}</p>
          <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando cohorte...</div>}>
      <CohorteDynamic cohorte={cohorte} currentUser={user!} />
    </Suspense>
  );
}
