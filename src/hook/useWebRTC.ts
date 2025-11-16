// src/hooks/useWebRTC.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Participant, RemoteStream, UserMediaState, DEFAULT_ICE_SERVERS } from '@/types/webrtc.types';

interface UseWebRTCProps {
  roomId: string;
  token: string;
  onError?: (error: string) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
}

export const useWebRTC = ({ roomId, token, onError, onUserJoined, onUserLeft }: UseWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mediaState, setMediaState] = useState<UserMediaState>({
    audio: true,
    video: true,
    screen: false,
  });

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Inicializar stream local
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error al obtener stream local:', error);
      onError?.('No se pudo acceder a la cámara o micrófono');
      throw error;
    }
  }, [onError]);

  // Crear peer connection
  const createPeerConnection = useCallback(
    (userId: string, isInitiator: boolean): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

      // Agregar tracks locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Manejar ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('iceCandidate', {
            roomId,
            targetUserId: userId,
            candidate: event.candidate,
          });
        }
      };

      // Manejar remote stream
      pc.ontrack = (event) => {
        console.log('📺 Stream remoto recibido de:', userId);
        setRemoteStreams((prev) => {
          const exists = prev.find((s) => s.userId === userId);
          if (exists) {
            return prev.map((s) => (s.userId === userId ? { ...s, stream: event.streams[0] } : s));
          }
          return [
            ...prev,
            {
              userId,
              stream: event.streams[0],
              audio: true,
              video: true,
              screen: false,
            },
          ];
        });
      };

      // Manejar cambios de estado de conexión
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE Connection State (${userId}):`, pc.iceConnectionState);
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          closePeerConnection(userId);
        }
      };

      peerConnectionsRef.current.set(userId, pc);

      // Si somos iniciadores, crear oferta
      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current?.emit('offer', {
              roomId,
              targetUserId: userId,
              type: 'offer',
              sdp: pc.localDescription,
            });
          })
          .catch((error) => console.error('Error al crear oferta:', error));
      }

      return pc;
    },
    [roomId]
  );

  // Cerrar peer connection
  const closePeerConnection = useCallback((userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
    }
    setRemoteStreams((prev) => prev.filter((s) => s.userId !== userId));
  }, []);

  // Conectar a WebSocket
  useEffect(() => {
    if (!token) {
      console.warn('Socket NO se inicia: token vacío');
      return;
    }

    const socket = io(`${API_URL}/webrtc`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      autoConnect: false, // ⬅️ evita conectar sin token real
    });

    socket.connect(); // ⬅️ ahora sí se conecta con token OK

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Conectado a WebRTC');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado de WebRTC');
      setIsConnected(false);
      setIsInRoom(false);
    });

    socket.on('connected', (data) => {
      console.log('Usuario conectado:', data.userId);
    });

    socket.on('joinedRoom', async (data) => {
      console.log('✅ Unido a sala:', data.roomId);
      setIsInRoom(true);
      setParticipants(data.participants || []);

      // Iniciar stream local si no está iniciado
      if (!localStreamRef.current) {
        await initializeLocalStream();
      }

      // Crear conexiones con participantes existentes
      data.participants?.forEach((participant: Participant) => {
        if (participant.userId !== data.userId) {
          createPeerConnection(participant.userId, true);
        }
      });
    });

    socket.on('userJoined', (data) => {
      console.log('👤 Usuario se unió:', data.userId);
      onUserJoined?.(data.userId);
      setParticipants((prev) => [...prev, data]);
      createPeerConnection(data.userId, false);
    });

    socket.on('userLeft', (data) => {
      console.log('👋 Usuario se fue:', data.userId);
      onUserLeft?.(data.userId);
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      closePeerConnection(data.userId);
    });

    socket.on('offer', async (data) => {
      console.log('📥 Oferta recibida de:', data.fromUserId);
      let pc = peerConnectionsRef.current.get(data.fromUserId);

      if (!pc) {
        pc = createPeerConnection(data.fromUserId, false);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', {
        roomId: data.roomId,
        targetUserId: data.fromUserId,
        type: 'answer',
        sdp: answer,
      });
    });

    socket.on('answer', async (data) => {
      console.log('📥 Respuesta recibida de:', data.fromUserId);
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    socket.on('iceCandidate', async (data) => {
      console.log('🧊 ICE candidate de:', data.fromUserId);
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('userMediaChanged', (data) => {
      console.log('🎬 Media cambió:', data);
      setRemoteStreams((prev) =>
        prev.map((stream) =>
          stream.userId === data.userId
            ? {
                ...stream,
                audio: data.audio ?? stream.audio,
                video: data.video ?? stream.video,
                screen: data.screen ?? stream.screen,
              }
            : stream
        )
      );
    });

    socket.on('error', (data) => {
      console.error('❌ Error:', data.message);
      onError?.(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, API_URL, createPeerConnection, closePeerConnection, initializeLocalStream, onError, onUserJoined, onUserLeft]);

  // Unirse a sala
  const joinRoom = useCallback(async () => {
    if (!socketRef.current?.connected) {
      onError?.('No estás conectado al servidor');
      return;
    }

    try {
      await initializeLocalStream();

      socketRef.current.emit('joinRoom', {
        roomId,
        audio: mediaState.audio,
        video: mediaState.video,
      });
    } catch (error) {
      console.error('Error al unirse a sala:', error);
      onError?.('Error al unirse a la sala');
    }
  }, [roomId, mediaState, initializeLocalStream, onError]);

  // Salir de sala
  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('leaveRoom', { roomId });

    // Cerrar todas las conexiones
    peerConnectionsRef.current.forEach((pc, userId) => {
      closePeerConnection(userId);
    });

    // Detener stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Detener screen share si está activo
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    setIsInRoom(false);
    setRemoteStreams([]);
    setParticipants([]);
    setMediaState({ audio: true, video: true, screen: false });
  }, [roomId, closePeerConnection]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;

    const newState = !mediaState.audio;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = newState;
    });

    setMediaState((prev) => ({ ...prev, audio: newState }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleAudio', { roomId, enabled: newState });
    }
  }, [mediaState.audio, roomId, isInRoom]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;

    const newState = !mediaState.video;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = newState;
    });

    setMediaState((prev) => ({ ...prev, video: newState }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleVideo', { roomId, enabled: newState });
    }
  }, [mediaState.video, roomId, isInRoom]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    const newState = !mediaState.screen;

    if (newState) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Reemplazar video track en todas las conexiones
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Actualizar stream local visualmente
        const newStream = new MediaStream([screenTrack, ...(localStreamRef.current?.getAudioTracks() || [])]);
        setLocalStream(newStream);

        // Manejar cuando el usuario detiene compartir desde el navegador
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setMediaState((prev) => ({ ...prev, screen: true }));

        if (socketRef.current && isInRoom) {
          socketRef.current.emit('toggleScreenShare', { roomId, enabled: true });
        }
      } catch (error) {
        console.error('Error al compartir pantalla:', error);
        onError?.('No se pudo compartir la pantalla');
      }
    } else {
      // Detener screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Volver a video de cámara
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        setLocalStream(localStreamRef.current);
      }

      setMediaState((prev) => ({ ...prev, screen: false }));

      if (socketRef.current && isInRoom) {
        socketRef.current.emit('toggleScreenShare', { roomId, enabled: false });
      }
    }
  }, [mediaState.screen, roomId, isInRoom, onError]);

  return {
    // Estado
    isConnected,
    isInRoom,
    localStream,
    remoteStreams,
    participants,
    mediaState,

    // Acciones
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
