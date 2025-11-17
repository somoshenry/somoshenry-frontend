// src/components/LiveClass/LiveClassRoom.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hook/useWebRTC';
import { VideoGrid } from './VideoGrid';
import { LiveControls } from './LiveControls';
import { ParticipantsList } from './ParticipantsList';
import { ClassInfo } from './ClassInfo';

interface UserData {
  name?: string | null;
  lastName?: string | null;
  username?: string | null;
  profilePicture?: string | null;
}

interface LiveClassRoomProps {
  roomId: string;
  token: string;
  classInfo: {
    name: string;
    description: string;
    time: string;
    instructor?: {
      name: string;
      title: string;
      avatar?: string;
    };
  };
  user: UserData; // ← agregado correctamente
}

export const LiveClassRoom: React.FC<LiveClassRoomProps> = ({
  roomId,
  token,
  classInfo,
  user, // ← recibido correctamente
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);

  // Prevenir doble join
  const hasJoined = useRef(false);

  const { isConnected, isInRoom, localStream, remoteStreams, participants, mediaState, joinRoom, leaveRoom, toggleAudio, toggleVideo, toggleScreenShare } = useWebRTC({
    roomId,
    token,
    onError: (err) => setError(err),
    onUserJoined: (userId) => {
      console.log('Usuario se unió:', userId);
    },
    onUserLeft: (userId) => {
      console.log('Usuario se fue:', userId);
    },
  });

  // Ejecutar joinRoom solo una vez
  useEffect(() => {
    if (!isConnected) return;
    if (hasJoined.current) return;

    hasJoined.current = true;
    joinRoom();
  }, [isConnected, joinRoom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isInRoom) leaveRoom();
    };
  }, [isInRoom, leaveRoom]);

  const handleLeave = () => {
    leaveRoom();
    router.push('/live/create');
  };

  // ====== UI ======

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Conectando...</p>
          <p className="text-sm text-gray-600 mt-2">Preparando tu clase en vivo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-lg w-full">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Error de Conexión</h2>
          <p className="text-gray-600 text-center mb-6 whitespace-pre-line">{error}</p>

          <div className="space-y-3">
            <button onClick={() => globalThis.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Reintentar
            </button>

            <button onClick={() => router.push('/live/create')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors">
              Volver a Salas
            </button>
          </div>

          {error.includes('cámara') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Consejo:</strong> Si la cámara está en uso:
              </p>
              <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Cierra otras pestañas que usen la cámara</li>
                <li>Cierra aplicaciones como Zoom, Meet, OBS</li>
                <li>Recarga la página después de cerrarlas</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={handleLeave} className="text-gray-600 hover:text-gray-900 transition-colors p-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Clase en Vivo</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">SomosHenry</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowChat(!showChat)} className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <span className="hidden sm:inline">{showChat ? 'Ocultar Chat' : 'Mostrar Chat'}</span>
              <span className="sm:hidden">💬</span>
            </button>

            <div className="flex items-center gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-red-50 rounded-lg">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-red-600">EN VIVO</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-[2000px] mx-auto p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Video */}
          <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '400px', height: 'calc(100vh - 200px)' }}>
              {isInRoom ? (
                <VideoGrid localStream={localStream} remoteStreams={remoteStreams} localAudio={mediaState.audio} localVideo={mediaState.video} user={user} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Uniéndose a la sala...</p>
                  </div>
                </div>
              )}
            </div>

            {isInRoom && <LiveControls mediaState={mediaState} onToggleAudio={toggleAudio} onToggleVideo={toggleVideo} onToggleScreen={toggleScreenShare} onLeave={handleLeave} />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <ClassInfo className={classInfo.name} description={classInfo.description} time={classInfo.time} instructor={classInfo.instructor} />

            <ParticipantsList participants={participants} />

            {showChat && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat en vivo</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 text-sm">Integra aquí tu componente de chat existente</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
