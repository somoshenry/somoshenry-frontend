// src/components/LiveClass/VideoGrid.tsx

'use client';

import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { RemoteStream } from '@/types/webrtc.types';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  user: {
    name?: string | null;
    lastName?: string | null;
    username?: string | null;
    profilePicture?: string | null;
  };
  localAudio: boolean;
  localVideo: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ localStream, remoteStreams, user, localAudio, localVideo }) => {
  const localFullName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Tú';

  const localAvatar = user.profilePicture || null;

  // -------------------------
  // LAYOUT RESPONSIVE MEJORADO
  // -------------------------
  const total = 1 + remoteStreams.length;

  // Layout más inteligente para diferentes cantidades de participantes
  let gridClass = '';

  if (total === 1) {
    gridClass = 'grid-cols-1';
  } else if (total === 2) {
    gridClass = 'grid-cols-1 md:grid-cols-2';
  } else if (total === 3 || total === 4) {
    gridClass = 'grid-cols-1 sm:grid-cols-2';
  } else {
    gridClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }

  return (
    <div className={`w-full h-full p-2 sm:p-4 grid ${gridClass} gap-2 sm:gap-4 overflow-auto`}>
      {/* ========================== */}
      {/*         LOCAL VIDEO         */}
      {/* ========================== */}

      <div className="relative w-full aspect-video min-h-[200px] sm:min-h-[250px] bg-black rounded-lg sm:rounded-xl overflow-hidden border-2 border-yellow-500/50 shadow-lg">
        <VideoPlayer stream={localStream} muted={true} isLocal={true} username={localFullName} audio={localAudio} video={localVideo} avatar={localAvatar} className="w-full h-full" />

        {/* Badge "TÚ" */}
        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold shadow-lg">TÚ</div>

        {/* Indicadores de audio/video */}
        <div className="absolute top-2 left-2 flex gap-1">
          {!localAudio && (
            <span className="px-2 py-1 text-xs bg-red-600 rounded-md text-white font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Mudo
            </span>
          )}
          {!localVideo && <span className="px-2 py-1 text-xs bg-red-600 rounded-md text-white font-medium">Sin Cámara</span>}
        </div>
      </div>

      {/* ========================== */}
      {/*      REMOTE PARTICIPANTS   */}
      {/* ========================== */}

      {remoteStreams.map((remote) => {
        const fullName = `${remote.name ?? ''} ${remote.lastName ?? ''}`.trim() || remote.username || 'Invitado';

        return (
          <div key={remote.userId} className="relative w-full aspect-video min-h-[200px] sm:min-h-[250px] bg-black rounded-lg sm:rounded-xl overflow-hidden border border-gray-600 shadow-lg">
            <VideoPlayer stream={remote.stream} muted={false} username={fullName} isLocal={false} audio={remote.audio} video={remote.video} avatar={remote.avatar ?? null} className="w-full h-full" />

            {/* Nombre del participante */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">{fullName}</div>

            {/* Indicadores en la parte superior */}
            <div className="absolute top-2 right-2 flex gap-1">
              {!remote.audio && (
                <span className="px-2 py-1 text-xs bg-red-600 rounded-md text-white font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Mudo
                </span>
              )}
              {!remote.video && <span className="px-2 py-1 text-xs bg-blue-600 rounded-md text-white font-medium">Sin Cámara</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
