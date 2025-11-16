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
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, username = 'Usuario', isLocal = false, audio = true, video = true, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video */}
      <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />

      {/* Overlay cuando no hay video */}
      {!video && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">{username.charAt(0).toUpperCase()}</div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full flex items-center gap-2">
        <span className="text-white text-sm font-medium">{isLocal ? 'Tú' : username}</span>

        {/* Audio indicator */}
        {!audio && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Live badge (solo para local) */}
      {isLocal && (
        <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold">EN VIVO</span>
        </div>
      )}
    </div>
  );
};
