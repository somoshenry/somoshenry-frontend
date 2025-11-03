'use client';

import StatsOverview from './StatsOverview';
import ReportedPosts from './ReportedPosts';
import ReportedComments from './ReportedComments';
import UserManagement from './UserManagement';
import RecentActivity from './RecentActivity';

export default function AdminContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-64">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona usuarios, contenido reportado y supervisa la actividad de la plataforma</p>
        </div>

        {/* Estadísticas generales */}
        <StatsOverview />

        {/* Grid de secciones principales */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Posts reportados */}
          <ReportedPosts />

          {/* Comentarios reportados */}
          <ReportedComments />
        </div>

        {/* Gestión de usuarios */}
        <UserManagement />

        {/* Actividad reciente */}
        <RecentActivity />
      </div>
    </div>
  );
}
