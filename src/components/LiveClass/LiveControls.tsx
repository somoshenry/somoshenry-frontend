// src/components/LiveClass/LiveControls.tsx

'use client';

import Link from 'next/link';
import { UserMediaState } from '@/types/webrtc.types';

interface LiveControlsProps {
  mediaState: UserMediaState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  // Ya no necesitamos onLeave
}

export const LiveControls: React.FC<LiveControlsProps> = ({ mediaState, onToggleAudio, onToggleVideo, onToggleScreen }) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-6 bg-white border-t border-gray-200 px-4">
      {/* Botón Audio */}
      <button onClick={onToggleAudio} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg ${mediaState.audio ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-red-500 hover:bg-red-600 text-white'}`} title={mediaState.audio ? 'Silenciar' : 'Activar audio'}>
        {mediaState.audio ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Botón Video */}
      <button onClick={onToggleVideo} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg ${mediaState.video ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-red-500 hover:bg-red-600 text-white'}`} title={mediaState.video ? 'Apagar cámara' : 'Encender cámara'}>
        {mediaState.video ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13.5V6.5a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 7.5v2.293l-3-3V5.5A2 2 0 009 3.5H6.707l-3-3zM7.414 6L11 9.586V13.5a2 2 0 01-2 2H4a2 2 0 01-2-2V7.5a2 2 0 012-2h3.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Botón Compartir Pantalla */}
      <button onClick={onToggleScreen} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg ${mediaState.screen ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`} title={mediaState.screen ? 'Dejar de compartir' : 'Compartir pantalla'}>
        {mediaState.screen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 4h12v8H4V8zm6 2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 4h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zm4 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Texto de ayuda en móviles */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none sm:hidden">Desliza para ver todos los controles</div>
    </div>
  );
};
