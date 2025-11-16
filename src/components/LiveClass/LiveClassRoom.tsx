// src/components/LiveClass/LiveClassRoom.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hook/useWebRTC';
import { VideoGrid } from './VideoGrid';
import { LiveControls } from './LiveControls';
import { ParticipantsList } from './ParticipantsList';
import { ClassInfo } from './ClassInfo';

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
}

export const LiveClassRoom: React.FC<LiveClassRoomProps> = ({ roomId, token, classInfo }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);

  const { isConnected, isInRoom, localStream, remoteStreams, participants, mediaState, joinRoom, leaveRoom, toggleAudio, toggleVideo, toggleScreenShare } = useWebRTC({
    roomId,
    token,
    onError: (err) => setError(err),
    onUserJoined: (userId) => {
      console.log('Usuario se unió:', userId);
      // Puedes mostrar una notificación aquí
    },
    onUserLeft: (userId) => {
      console.log('Usuario se fue:', userId);
      // Puedes mostrar una notificación aquí
    },
  });

  // Auto-join cuando se conecta
  useEffect(() => {
    if (isConnected && !isInRoom) {
      joinRoom();
    }
  }, [isConnected, isInRoom, joinRoom]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (isInRoom) {
        leaveRoom();
      }
    };
  }, [isInRoom, leaveRoom]);

  const handleLeave = () => {
    leaveRoom();
    router.push('/dashboard'); // Ajusta según tu ruta
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Error de Conexión</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={handleLeave} className="text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clase en Vivo</h1>
              <p className="text-sm text-gray-600">SomosHenry</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowChat(!showChat)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              {showChat ? 'Ocultar Chat' : 'Mostrar Chat'}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-red-600">EN VIVO</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Video Area */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
              {isInRoom ? (
                <VideoGrid localStream={localStream} remoteStreams={remoteStreams} localAudio={mediaState.audio} localVideo={mediaState.video} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Uniéndose a la sala...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {isInRoom && <LiveControls mediaState={mediaState} onToggleAudio={toggleAudio} onToggleVideo={toggleVideo} onToggleScreen={toggleScreenShare} onLeave={handleLeave} />}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Class Info */}
            <ClassInfo className={classInfo.name} description={classInfo.description} time={classInfo.time} instructor={classInfo.instructor} />

            {/* Participants */}
            <ParticipantsList participants={participants} />

            {/* Chat (placeholder - usa tu componente de chat existente) */}
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
