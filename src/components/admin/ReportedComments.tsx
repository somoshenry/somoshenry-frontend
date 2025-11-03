import { MessageSquare, Trash2, CheckCircle, Eye } from 'lucide-react';

export default function ReportedComments() {
  // Datos estáticos de ejemplo
  const reportedComments = [
    {
      id: 1,
      author: 'Roberto Díaz',
      comment: 'Este comentario contiene lenguaje inapropiado...',
      postTitle: 'Discusión sobre tecnología',
      reports: 4,
      reason: 'Lenguaje ofensivo',
      date: '2024-11-02',
    },
    {
      id: 2,
      author: 'Elena Ruiz',
      comment: 'Comentario con posible acoso hacia otro usuario...',
      postTitle: 'Evento de la comunidad',
      reports: 7,
      reason: 'Acoso',
      date: '2024-11-03',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comentarios Reportados</h2>
          <span className="ml-auto bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">{reportedComments.length} pendientes</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {reportedComments.map((comment) => (
          <div key={comment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{comment.author}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.comment}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Post: <span className="font-medium">{comment.postTitle}</span>
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">{comment.reports} reportes</span>
                  <span className="text-gray-600 dark:text-gray-400">Razón: {comment.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                <Eye size={16} />
                Ver contexto
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
