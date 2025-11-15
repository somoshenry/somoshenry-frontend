'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hook/useAuth';
import StatsOverview from './StatsOverview';
import ReportedPosts from './ReportedPosts';
import ReportedComments from './ReportedComments';
import UserManagement from './UserManagement';
import AuditLog from './AuditLog';
import CohorteManagement from './CohorteManagement';
import MetricsDashboard from './MetricsDashboard';
import { Shield, AlertTriangle, Users, TrendingUp, FileText, UserCog } from 'lucide-react';

type AdminTab = 'reportes' | 'usuarios' | 'auditoria' | 'cohortes' | 'metricas';

export default function AdminContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('reportes');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No hay usuario, redirigir a login
        router.push('/login');
      } else if (user.role === 'ADMIN') {
        // Usuario es admin, continuar
      } else {
        // Usuario no es admin, se mostrará mensaje
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Se está redirigiendo
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder al panel de administración.
            <br />
            Tu rol actual es: <span className="font-semibold">{user.role}</span>
          </p>
          <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona usuarios, contenido reportado y supervisa la actividad de la plataforma</p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sesión activa: <span className="font-semibold">{user.email}</span> | Rol: <span className="font-semibold text-blue-600 dark:text-blue-400">{user.role}</span>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 p-2 overflow-x-auto">
            <button onClick={() => setActiveTab('reportes')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'reportes' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <AlertTriangle size={20} />
              Reportes
            </button>
            <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'usuarios' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <UserCog size={20} />
              Usuarios
            </button>
            <button onClick={() => setActiveTab('auditoria')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'auditoria' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <FileText size={20} />
              Auditoría
            </button>
            <button onClick={() => setActiveTab('cohortes')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'cohortes' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Users size={20} />
              Gestión de Cohortes
            </button>
            <button onClick={() => setActiveTab('metricas')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'metricas' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <TrendingUp size={20} />
              Métricas
            </button>
          </div>
        </div>

        {/* Contenido según la pestaña activa */}
        {activeTab === 'reportes' && (
          <>
            {/* Estadísticas generales */}
            <StatsOverview />

            {/* Grid de secciones principales */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Posts reportados */}
              <ReportedPosts />

              {/* Comentarios reportados */}
              <ReportedComments />
            </div>
          </>
        )}

        {activeTab === 'usuarios' && (
          <>
            {/* Gestión de usuarios */}
            <UserManagement />
          </>
        )}

        {activeTab === 'auditoria' && (
          <>
            {/* Registro de Auditoría */}
            <AuditLog />
          </>
        )}

        {activeTab === 'cohortes' && (
          <>
            {/* Gestión de Cohortes */}
            <CohorteManagement />
          </>
        )}

        {activeTab === 'metricas' && (
          <>
            {/* Dashboard de Métricas */}
            <MetricsDashboard />
          </>
        )}
      </div>
    </div>
  );
}
