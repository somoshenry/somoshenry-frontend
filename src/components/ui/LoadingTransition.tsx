'use client';

interface LoadingTransitionProps {
  message?: string;
}

export default function LoadingTransition({ message = 'Cargando...' }: LoadingTransitionProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-9999 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#ffff00] border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Mensaje */}
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 animate-pulse mb-4">{message}</p>

        {/* Puntos animados */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-[#ffff00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#ffff00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#ffff00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
