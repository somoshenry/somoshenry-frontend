'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hook/useAuth';
import { getMyCohortes, translateStatus, getStatusColor } from '@/services/cohorteService';
import { Users, Calendar, Clock } from 'lucide-react';

export default function CohortePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cohortes, setCohortes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCohortes = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const allCohortes = await getMyCohortes();
        const myCohortes = allCohortes.filter((c) => c.members?.some((m: any) => m.user.id === user.id) || user.role === 'ADMIN');

        if (myCohortes.length === 1) {
          // Si solo tiene una cohorte, redirigir automáticamente
          router.push(`/cohorte/${myCohortes[0].id}`);
        } else {
          setCohortes(myCohortes);
        }
      } catch (error) {
        console.error('Error al obtener cohortes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCohortes();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando cohortes...</p>
        </div>
      </div>
    );
  }

  if (cohortes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sin Cohortes Asignadas</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Aún no tienes cohortes asignadas. Contacta con el administrador para ser agregado a una cohorte.</p>
          <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Cohortes</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Selecciona una cohorte para acceder a su contenido</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohortes.map((cohorte) => (
            <div key={cohorte.id} onClick={() => router.push(`/cohorte/${cohorte.id}`)} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:scale-105 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cohorte.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cohorte.status)}`}>{translateStatus(cohorte.status)}</span>
              </div>

              {cohorte.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{cohorte.description}</p>}

              <div className="space-y-2">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
