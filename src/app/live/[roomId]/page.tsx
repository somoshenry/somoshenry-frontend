'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWebRTC } from '../../../hook/useWebRTC';
import { VideoGrid } from '@/components/LiveClass/VideoGrid';
import { ParticipantsList } from '@/components/LiveClass/ParticipantsList';
import { getUserProfile } from '../../../services/userService'; // necesitas este servicio
import { Loader2 } from 'lucide-react';

export default function LiveClassPage() {
  const { roomId } = useParams() as { roomId: string };

  // Usuario logueado (del backend)
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Token desde localStorage (tu login lo guarda ahí)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  // Hook WebRTC
  const { isConnected, isInRoom, localStream, remoteStreams, participants, joinRoom, leaveRoom, toggleAudio, toggleVideo, toggleScreenShare, mediaState } = useWebRTC({
    roomId,
    token,
    onError: (err) => console.error(err),
  });

  // Traer datos del usuario
  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await getUserProfile(); // ← ESTA ES LA LÍNEA CORRECTA
        setUser(profile);
      } catch (e) {
        console.error(e);
      }
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  // Unirse automáticamente
  useEffect(() => {
    if (isConnected && !isInRoom) {
      joinRoom();
    }
  }, [isConnected]);

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
    <div className="w-full h-screen flex bg-[#0d0f16] text-white overflow-hidden">
      {/* ========================= */}
      {/*      VIDEO AREA           */}
      {/* ========================= */}

      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Clase en vivo</h2>

          <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold">EN VIVO</span>
        </div>

        {/* Video grid */}
        <div className="flex-1 overflow-hidden rounded-xl bg-black/20">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} user={user} />
        </div>

        {/* Controles */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button onClick={toggleAudio} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${mediaState.audio ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-500'}`}>
            🎤
          </button>

          <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${mediaState.video ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-500'}`}>
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

      {/* ========================= */}
      {/*      SIDEBAR DERECHA      */}
      {/* ========================= */}

      <aside className="w-[320px] bg-[#141722] border-l border-gray-800 flex flex-col">
        {/* -------- INFO CLASE -------- */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold mb-1">Clase #{roomId}</h3>
          <p className="text-xs text-gray-400">
            Profesor:{' '}
            <span className="text-yellow-400">
              {user?.name} {user?.lastName}
            </span>
          </p>
        </div>

        {/* -------- PARTICIPANTES -------- */}
        <div className="p-4 border-b border-gray-800 flex-1 overflow-y-auto">
          <ParticipantsList participants={participants} />
        </div>

        {/* -------- CHAT -------- */}
        <div className="p-4">
          <div className="bg-black/20 h-60 rounded-xl flex items-center justify-center text-gray-400 text-sm">Integra tu chat aquí</div>
        </div>
      </aside>
    </div>
  );
}
