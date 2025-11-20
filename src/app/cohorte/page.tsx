'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hook/useAuth';
import { getMyCohortes, Cohorte, translateStatus, translateModality, getStatusColor } from '@/services/cohorteService';
import { Loader2, Users, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function CohortePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar cohortes del usuario al montar el componente
  useEffect(() => {
    async function loadCohortes() {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        // Pasar el rol del usuario - ADMIN verá todas las cohortes
        const myCohortes = await getMyCohortes(user.role);

        // Si solo tiene una cohorte, redirigir automáticamente
        if (myCohortes.length === 1) {
          router.push(`/cohorte/${myCohortes[0].id}`);
          return;
        }

        setCohortes(myCohortes);
      } catch (error) {
        console.error('Error al cargar cohortes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCohortes();

    // Escuchar eventos de asignación de cohorte para recargar automáticamente
    const handleCohorteAssigned = () => {
      console.log('🎓 Evento de cohorte asignada detectado, recargando...');
      loadCohortes();
    };

    globalThis.addEventListener('notification:cohorte_assigned', handleCohorteAssigned);

    return () => {
      globalThis.removeEventListener('notification:cohorte_assigned', handleCohorteAssigned);
    };
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando tus cohortes...</p>
        </div>
      </div>
    );
  }

  if (cohortes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No tienes cohortes asignadas</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Contacta con un administrador para ser agregado a una cohorte.</p>
          <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando cohortes...</div>}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Cohortes</h1>
            <p className="text-gray-600 dark:text-gray-400">Selecciona una cohorte para ver su contenido</p>
          </div>

          {/* Grid de cohortes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohortes.map((cohorte) => {
              const currentMember = cohorte.members?.find((m) => m.user.id === user?.id);
              const userRole = currentMember?.role || 'STUDENT';

              return (
                <div key={cohorte.id} onClick={() => router.push(`/cohorte/${cohorte.id}`)} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
                  {/* Header de la cohorte */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{cohorte.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cohorte.status)}`}>{translateStatus(cohorte.status)}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{translateModality(cohorte.modality)}</span>
                    </div>
                  </div>

                  {/* Descripción */}
                  {cohorte.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{cohorte.description}</p>}

                  {/* Información */}
                  <div className="space-y-2 mb-4">
                    {cohorte.startDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={16} />
                        <span>{new Date(cohorte.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cohorte.schedule && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>{cohorte.schedule}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users size={16} />
                      <span>{cohorte.members?.length || 0} miembros</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Tu rol: <span className="font-semibold">{userRole}</span>
                    </span>
                    <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
