import { AlertTriangle, Trash2, CheckCircle, Eye } from 'lucide-react';

export default function ReportedPosts() {
  // Datos estáticos de ejemplo
  const reportedPosts = [
    {
      id: 1,
      author: 'Juan Pérez',
      content: 'Este es un post que ha sido reportado por contenido inapropiado...',
      reports: 5,
      reason: 'Contenido ofensivo',
      date: '2024-11-01',
    },
    {
      id: 2,
      author: 'María García',
      content: 'Post con posible spam o publicidad no autorizada...',
      reports: 3,
      reason: 'Spam',
      date: '2024-11-02',
    },
    {
      id: 3,
      author: 'Carlos López',
      content: 'Contenido que podría violar las normas de la comunidad...',
      reports: 8,
      reason: 'Acoso',
      date: '2024-11-03',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts Reportados</h2>
          <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">{reportedPosts.length} pendientes</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {reportedPosts.map((post) => (
          <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-600 dark:text-red-400 font-medium">{post.reports} reportes</span>
                  <span className="text-gray-600 dark:text-gray-400">Razón: {post.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                <Eye size={16} />
                Ver detalles
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                <CheckCircle size={16} />
                Aprobar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
