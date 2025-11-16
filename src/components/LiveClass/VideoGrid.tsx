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
}

export const VideoGrid: React.FC<VideoGridProps> = ({ localStream, remoteStreams, user }) => {
  const localFullName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Tú';

  const localAvatar = user.profilePicture || null;

  // -------------------------
  // LAYOUT DINÁMICO PRO
  // -------------------------
  const total = 1 + remoteStreams.length;

  let cols = '1fr';
  if (total === 2) cols = 'repeat(2, 1fr)';
  if (total === 3) cols = 'repeat(3, 1fr)';
  if (total >= 4) cols = 'repeat(auto-fit, minmax(280px, 1fr))';

  return (
    <div
      className="w-full h-full p-4 grid gap-4 overflow-auto"
      style={{
        gridTemplateColumns: cols,
        gridAutoRows: 'minmax(250px, 1fr)',
      }}
    >
      {/* ========================== */}
      {/*         LOCAL VIDEO         */}
      {/* ========================== */}

      <div className="relative w-full h-full min-h-[250px] bg-black rounded-xl overflow-hidden border border-gray-700">
        <VideoPlayer stream={localStream} muted={true} isLocal={true} username={localFullName} audio={true} video={true} avatar={localAvatar} className="w-full h-full" />

        {/* Avatar si NO hay cámara */}
        {!localStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-yellow-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">{localFullName.charAt(0).toUpperCase()}</div>
          </div>
        )}

        {/* Nombre local */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">Tú — {localFullName}</div>
      </div>

      {/* ========================== */}
      {/*      REMOTE PARTICIPANTS   */}
      {/* ========================== */}

      {remoteStreams.map((remote) => {
        const fullName = `${remote.name ?? ''} ${remote.lastName ?? ''}`.trim() || remote.username || 'Invitado';

        return (
          <div key={remote.userId} className="relative w-full h-full min-h-[250px] bg-black rounded-xl overflow-hidden border border-gray-700">
            <VideoPlayer stream={remote.stream} muted={false} username={fullName} isLocal={false} audio={remote.audio} video={remote.video} avatar={remote.avatar ?? null} className="w-full h-full" />

            {/* Avatar cuando NO hay video */}
            {!remote.video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="w-20 h-20 rounded-full bg-yellow-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">{fullName.charAt(0).toUpperCase()}</div>
              </div>
            )}

            {/* Nombre del participante */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">{fullName}</div>

            {/* Indicadores */}
            <div className="absolute top-3 right-3 flex gap-2">
              {!remote.audio && <span className="px-2 py-1 text-xs bg-red-600 rounded-full text-white">Mic Off</span>}
              {!remote.video && <span className="px-2 py-1 text-xs bg-blue-600 rounded-full text-white">Cam Off</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
