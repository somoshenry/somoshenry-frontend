// src/components/LiveClass/ClassInfo.tsx

'use client';

interface ClassInfoProps {
  className: string;
  description: string;
  time: string;
  instructor?: {
    name: string;
    title: string;
    avatar?: string;
  };
}

export const ClassInfo: React.FC<ClassInfoProps> = ({ className, description, time, instructor }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
      {/* Header con hora */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{time}</span>
        </div>
      </div>

      {/* Título y descripción */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{className}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Profesor */}
      {instructor && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Profesor</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">{instructor.avatar ? <img src={instructor.avatar} alt={instructor.name} className="w-full h-full rounded-full object-cover" /> : instructor.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="font-semibold text-gray-900">{instructor.name}</p>
              <p className="text-sm text-gray-600">{instructor.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
