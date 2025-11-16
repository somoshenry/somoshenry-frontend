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
  avatar?: string | null; // ← agregado por si en futuro usás foto
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, username = 'Usuario', isLocal = false, audio = true, video = true, className = '', avatar = null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ==========================
  //  Stream → video element
  // ==========================
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* ========================== */}
      {/* VIDEO                     */}
      {/* ========================== */}
      <video ref={videoRef} autoPlay playsInline muted={muted} className={`w-full h-full object-cover transition-all duration-200 ${video ? '' : 'opacity-0 pointer-events-none'}`} />

      {/* ========================== */}
      {/* AVATAR / PLACEHOLDER      */}
      {/* ========================== */}
      {!video && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {avatar ? <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-xl" /> : <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-4xl font-bold flex items-center justify-center shadow-xl">{username.charAt(0).toUpperCase()}</div>}
        </div>
      )}

      {/* ========================== */}
      {/* NOMBRE                     */}
      {/* ========================== */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full flex items-center gap-2">
        <span className="text-white text-sm font-medium">{isLocal ? `Tú — ${username}` : username}</span>

        {/* MIC OFF */}
        {!audio && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 073707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* ========================== */}
      {/* BADGE EN VIVO (SOLO LOCAL) */}
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
