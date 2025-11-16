'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWebRTC } from '@/hook/useWebRTC';
import { VideoGrid } from '@/components/LiveClass/VideoGrid';
import { ParticipantsList } from '@/components/LiveClass/ParticipantsList';
import { LiveChat } from '@/components/LiveClass/LiveChat';
import { getUserProfile } from '@/services/userService';
import { tokenStore } from '@/services/tokenStore';
import { Loader2 } from 'lucide-react';

export default function LiveClassPage() {
  const { roomId } = useParams() as { roomId: string };

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const token = typeof window !== 'undefined' ? tokenStore.getAccess() || '' : '';

  const { isConnected, isInRoom, localStream, remoteStreams, participants, joinRoom, leaveRoom, toggleAudio, toggleVideo, toggleScreenShare, mediaState } = useWebRTC({
    roomId,
    token,
    onError: (err) => console.error(err),
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (e) {
        console.error(e);
      }
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  // 🔥 FIX: ahora React evalúa correctamente si debe ejecutar joinRoom()
  useEffect(() => {
    if (isConnected && !isInRoom) {
      joinRoom();
    }
  }, [isConnected, isInRoom]);

  if (loadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="w-full h-screen flex items-center justify-center text-white">Error cargando usuario.</div>;
  }

  return (
    <div
      className="flex bg-[#0d0f16] text-white overflow-hidden"
      style={{
        height: 'calc(100vh - 64px)',
        marginLeft: '240px',
      }}
    >
      {/* ======================= */}
      {/*      VIDEO AREA         */}
      {/* ======================= */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Clase en vivo</h2>
          <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold">EN VIVO</span>
        </div>

        {/* CONTENEDOR FIJO */}
        <div className="flex-1 w-full rounded-xl bg-black/20 p-4 overflow-auto">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} user={user} localAudio={mediaState.audio} localVideo={mediaState.video} />
        </div>

        {/* Controls */}
        <div className="mt-2 flex items-center justify-center gap-6 pb-4 shrink-0">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition 
          ${mediaState.audio ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-500'}`}
          >
            🎤
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition 
          ${mediaState.video ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-500'}`}
          >
            🎥
          </button>

          <button onClick={toggleScreenShare} className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-xl">
            🖥️
          </button>

          <button onClick={leaveRoom} className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-xl">
            📞
          </button>
        </div>
      </div>

      {/* ======================= */}
      {/*      SIDEBAR            */}
      {/* ======================= */}
      <aside className="w-[320px] bg-[#141722] border-l border-gray-800 flex flex-col overflow-hidden">
        {/* Info clase */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold mb-1">Clase #{roomId}</h3>
          <p className="text-xs text-gray-400">
            Profesor:{' '}
            <span className="text-yellow-400">
              {user?.name} {user?.lastName}
            </span>
          </p>
        </div>

        {/* Participantes */}
        <div className="p-4 border-b border-gray-800 flex-1 overflow-y-auto">
          <ParticipantsList participants={participants} />
        </div>

        {/* Chat */}
        <div className="p-4 shrink-0">
          <LiveChat roomId={roomId} token={token} userName={user?.username || user?.name || 'Usuario'} userAvatar={user?.avatar} />
        </div>
      </aside>
    </div>
  );
}
