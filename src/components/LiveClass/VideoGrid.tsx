// src/components/LiveClass/VideoGrid.tsx

'use client';

import { VideoPlayer } from './VideoPlayer';
import { RemoteStream } from '@/types/webrtc.types';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  localAudio: boolean;
  localVideo: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ localStream, remoteStreams, localAudio, localVideo }) => {
  const totalVideos = 1 + remoteStreams.length;

  // Determinar layout basado en cantidad de participantes
  const getGridClass = () => {
    if (totalVideos === 1) return 'grid-cols-1';
    if (totalVideos === 2) return 'grid-cols-2';
    if (totalVideos <= 4) return 'grid-cols-2';
    if (totalVideos <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full`}>
      {/* Video local */}
      <VideoPlayer stream={localStream} muted={true} username="Tú" isLocal={true} audio={localAudio} video={localVideo} className="w-full h-full min-h-[300px]" />

      {/* Videos remotos */}
      {remoteStreams.map((remoteStream) => (
        <VideoPlayer key={remoteStream.userId} stream={remoteStream.stream} muted={false} username={remoteStream.userId.substring(0, 8)} isLocal={false} audio={remoteStream.audio} video={remoteStream.video} className="w-full h-full min-h-[300px]" />
      ))}
    </div>
  );
};
