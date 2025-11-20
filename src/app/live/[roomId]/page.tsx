"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {useWebRTC} from "@/hook/useWebRTC";
import {VideoGrid} from "@/components/LiveClass/VideoGrid";
import {ParticipantsList} from "@/components/LiveClass/ParticipantsList";
import {getUserProfile} from "@/services/userService";
import {tokenStore} from "@/services/tokenStore";
import {Loader2, Users, X} from "lucide-react";

export default function LiveClassPage() {
  const {roomId} = useParams() as {roomId: string};

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false); // Estado para mostrar/ocultar participantes

  const token = typeof window !== "undefined" ? tokenStore.getAccess() || "" : "";

  const {
    isConnected,
    isInRoom,
    localStream,
    remoteStreams,
    participants,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    mediaState,
  } = useWebRTC({
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
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-[#ffff00] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center  bg-white dark:bg-gray-800 dark:text-white">
        Error cargando usuario.
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-0 md:left-64 right-0 bottom-0 bg-white dark:bg-gray-800 dark:text-white overflow-hidden">
      {/* ======================= */}
      {/*      VIDEO AREA         */}
      {/* ======================= */}
      <div className="w-full h-full relative">
        {/* Header compacto - Estilo Zoom/Meet */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-3 bg-linear-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-red-600 rounded text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                EN VIVO
              </span>

              {/* Botón para mostrar participantes */}
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 hover:bg-gray-800 rounded-lg transition-colors text-sm backdrop-blur-sm"
              >
                <Users size={16} />
                <span>{participants.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE VIDEO - Pantalla completa sin espacios */}
        <div className="absolute inset-0 bg-black">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            localAudio={mediaState.audio}
            localVideo={mediaState.video}
            localScreen={mediaState.screen}
            user={user}
          />
        </div>

        {/* Controls flotantes estilo Zoom/Meet - Centrados en la parte inferior */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-4 px-6 py-3 bg-gray-900/95 backdrop-blur-md rounded-full shadow-2xl border border-gray-700/50">
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110
                ${mediaState.audio ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"}`}
              title={mediaState.audio ? "Silenciar" : "Activar audio"}
            >
              {mediaState.audio ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110
                ${mediaState.video ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"}`}
              title={mediaState.video ? "Apagar cámara" : "Encender cámara"}
            >
              {mediaState.video ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13.5V6.5a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 7.5v2.293l-3-3V5.5A2 2 0 009 3.5H6.707l-3-3zM7.414 6L11 9.586V13.5a2 2 0 01-2 2H4a2 2 0 01-2-2V7.5a2 2 0 012-2h3.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110
                ${mediaState.screen ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}`}
              title={mediaState.screen ? "Dejar de compartir" : "Compartir pantalla"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 4h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ======================= */}
      {/*   SIDEBAR DESLIZABLE    */}
      {/* ======================= */}
      <aside
        className={`
          fixed top-16 right-0 h-[calc(100vh-64px)] w-[320px] bg-[#141722] border-l border-gray-800 
          transform transition-transform duration-300 ease-in-out z-50 shadow-2xl
          ${showParticipants ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} />
            Participantes ({participants.length})
          </h3>
          <button
            onClick={() => setShowParticipants(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de participantes */}
        <div className="p-4 overflow-y-auto h-[calc(100%-72px)]">
          <ParticipantsList participants={participants} />
        </div>
      </aside>

      {/* Overlay cuando el sidebar está abierto */}
      {showParticipants && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowParticipants(false)}
          style={{top: "64px"}}
        />
      )}
    </div>
  );
}
