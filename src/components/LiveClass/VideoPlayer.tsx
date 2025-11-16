// src/components/LiveClass/VideoPlayer.tsx

'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  username?: string;
  isLocal?: boolean;
  audio?: boolean;
  video?: boolean;
  className?: string;
  avatar?: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, username = 'Usuario', isLocal = false, audio = true, video = true, className = '', avatar = null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ============================================================
  // 🔥 FIX: Forzar actualización del video stream siempre
  // ============================================================
  useEffect(() => {
    if (!videoRef.current) return;

    if (stream) {
      // importante para forzar re-render de pista
      videoRef.current.srcObject = null;
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* ========================== */}
      {/* VIDEO */}
      {/* ========================== */}
      <video ref={videoRef} autoPlay playsInline muted={muted} className={`w-full h-full object-cover transition-all duration-200 ${video ? '' : 'opacity-0 pointer-events-none'}`} />

      {/* ========================== */}
      {/* AVATAR PLACEHOLDER */}
      {/* ========================== */}
      {!video && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {avatar ? <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-xl" /> : <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-4xl font-bold flex items-center justify-center shadow-xl">{username.charAt(0).toUpperCase()}</div>}
        </div>
      )}

      {/* ========================== */}
      {/* USERNAME */}
      {/* ========================== */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full flex items-center gap-2">
        <span className="text-white text-sm font-medium">{isLocal ? `Tú — ${username}` : username}</span>

        {/* MIC OFF ICON (fixeado) */}
        {!audio && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4a1 1 0 112 0v6a1 1 0 11-2 0V4zm-4.707.293a1 1 0 011.414 0L8 6.586V10a4 4 0 008 0V8a1 1 0 112 0v2a6 6 0 11-10.707-3.293L4.293 5.707a1 1 0 010-1.414zM15.707 14.707a1 1 0 01-1.414 0L12 12.414A6 6 0 016 10a1 1 0 010-2 4 4 0 007.293 2.707l2.414 2.414a1 1 0 010 1.586z" />
          </svg>
        )}
      </div>

      {/* ========================== */}
      {/* LIVE BADGE */}
      {/* ========================== */}
      {isLocal && (
        <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold">EN VIVO</span>
        </div>
      )}
    </div>
  );
};
