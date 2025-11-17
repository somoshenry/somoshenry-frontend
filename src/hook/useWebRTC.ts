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
  const participantsRef = useRef<Participant[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_ICE_SERVERS);

  // Helper para actualizar participants y mantener sincronizado el ref
  const updateParticipants = (updater: (prev: Participant[]) => Participant[]) => {
    setParticipants((prev) => {
      const newParticipants = updater(prev);
      participantsRef.current = newParticipants;
      return newParticipants;
    });
  };

  // ============================================================
  // 🧊 1) CARGAR ICE SERVERS DESDE EL BACKEND (OPCIONAL)
  // ============================================================
  useEffect(() => {
    const loadIceServers = async () => {
      try {
        const res = await fetch(`${API_URL}/webrtc/ice-servers`);

        if (!res.ok) {
          console.warn(`⚠️ ICE servers endpoint retornó ${res.status}. Usando servidores STUN públicos.`);
          return;
        }

        const data = await res.json();

        if (data?.iceServers) {
          iceServersRef.current = data.iceServers;
          console.log('✅ ICE servers cargados desde backend:', data.iceServers);
        }
      } catch (err) {
        console.warn('⚠️ No se pudieron cargar ICE Servers del backend. Usando STUN públicos de Google.');
        console.log('💡 Esto es normal si el endpoint /webrtc/ice-servers no está configurado.');
      }
    };

    loadIceServers();
  }, [API_URL]);

  // ============================================================
  // 🎥 2) INICIALIZAR CÁMARA
  // ============================================================
  useEffect(() => {
    const initLocalMedia = async () => {
      if (localStreamRef.current) {
        console.log('✅ Stream local ya existe, reutilizando...');
        return;
      }

      try {
        console.log('🎥 Solicitando acceso a cámara y micrófono...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log('✅ Cámara y micrófono inicializados correctamente');
      } catch (error: any) {
        console.error('❌ Error al acceder a cámara/micrófono:', error);

        let errorMessage = 'No se pudo acceder a la cámara/micrófono';

        if (error.name === 'NotReadableError') {
          errorMessage = '⚠️ La cámara/micrófono ya está siendo usada por otra aplicación o pestaña. Por favor ciérrala e intenta de nuevo.';
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = '⚠️ Permiso denegado. Por favor permite el acceso a la cámara y micrófono en tu navegador.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '⚠️ No se encontró cámara o micrófono conectado a tu dispositivo.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = '⚠️ Tu cámara no cumple con los requisitos solicitados. Intentando con configuración básica...';

          // Reintentar con configuración más simple
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            localStreamRef.current = basicStream;
            setLocalStream(basicStream);
            console.log('✅ Cámara inicializada con configuración básica');
            return;
          } catch (retryError) {
            console.error('❌ Reintento fallido:', retryError);
          }
        }

        onError?.(errorMessage);
      }
    };

    if (typeof globalThis.window !== 'undefined') initLocalMedia();
  }, [onError]);

  // ============================================================
  // 🔌 3) CONEXIÓN SOCKET
  // ============================================================
  useEffect(() => {
    if (!token) return;

    const socket = io(`${API_URL}/webrtc`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsInRoom(false);
    });

    // ============================================================
    // 🟢 JOINED ROOM
    // ============================================================
    socket.on('joinedRoom', async (data) => {
      console.log('🟢 JOINED ROOM. Participantes existentes:', data.participants?.length);
      setIsInRoom(true);
      updateParticipants(() => data.participants || []);

      const myId = data.user?.userId;

      // POR CADA PARTICIPANTE EXISTENTE → CREAR PEER CONNECTION
      // PERO NO GENERAR OFFER, el otro lado generará offer
      for (const p of data.participants) {
        if (p.userId === myId) continue;

        console.log(`📍 Preparando conexión con ${p.userId}`);

        const pc = new RTCPeerConnection({
          iceServers: iceServersRef.current,
        });

        peerConnectionsRef.current.set(p.userId, pc);

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
        }

        pc.onicecandidate = (event) => {
          if (event.candidate)
            socket.emit('iceCandidate', {
              roomId,
              targetUserId: p.userId,
              candidate: event.candidate,
            });
        };

        pc.ontrack = (event) => {
          console.log('🎥 ontrack en joinedRoom de', p.userId, 'stream tracks:', event.streams[0]?.getTracks().length);
          setRemoteStreams((prev) => {
            const exists = prev.find((s) => s.userId === p.userId);
            const base: RemoteStream = {
              userId: p.userId,
              stream: event.streams[0],
              audio: p.audio,
              video: p.video,
              screen: p.screen,
              name: p.name,
              lastName: p.lastName,
              username: p.username,
              avatar: p.avatar,
            };

            if (exists) return prev.map((s) => (s.userId === p.userId ? { ...s, ...base } : s));

            return [...prev, base];
          });
        };

        // Agregar listeners de estado
        pc.onconnectionstatechange = () => {
          console.log(`❇️ Connection state con ${p.userId}:`, pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
          console.log(`❇️ ICE connection state con ${p.userId}:`, pc.iceConnectionState);
        };

        // NO generar offer aquí - esperamos que ellos envíen offer
        // YO generaré offer cuando reciba un 'userJoined' para ellos
      }
    });

    // ============================================================
    // 👤 USER JOINED
    // ============================================================
    socket.on('userJoined', async (data) => {
      console.log(`👤 USER JOINED: ${data.userId}`);
      updateParticipants((prev) => [...prev, data]);
      onUserJoined?.(data.userId);

      const pc = new RTCPeerConnection({
        iceServers: iceServersRef.current,
      });

      peerConnectionsRef.current.set(data.userId, pc);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate)
          socket.emit('iceCandidate', {
            roomId,
            targetUserId: data.userId,
            candidate: event.candidate,
          });
      };

      pc.ontrack = (event) => {
        console.log('🎥 ontrack en userJoined de', data.userId, 'stream tracks:', event.streams[0]?.getTracks().length);
        setRemoteStreams((prev) => [
          ...prev.filter((s) => s.userId !== data.userId),
          {
            userId: data.userId,
            stream: event.streams[0],
            audio: data.audio,
            video: data.video,
            screen: data.screen,
            name: data.name,
            lastName: data.lastName,
            username: data.username,
            avatar: data.avatar,
          },
        ]);
      };

      // Agregar listeners de estado
      pc.onconnectionstatechange = () => {
        console.log(`❇️ Connection state con ${data.userId}:`, pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`❇️ ICE connection state con ${data.userId}:`, pc.iceConnectionState);
      };

      // EL USUARIO NUEVO GENERA EL OFFER - nosotros solo esperamos
      // NO generamos offer aquí, el nuevo usuario enviará offer al recibir el evento 'joinedRoom'

      // Ahora SÍ generamos OFFER porque somos el "primer usuario" y el nuevo se debe conectar a nosotros
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log(`📤 Enviando OFFER a ${data.userId}`);
        socket.emit('offer', {
          roomId,
          targetUserId: data.userId,
          sdp: offer,
        });
      } catch (err) {
        console.error(`Error creando offer para ${data.userId}:`, err);
      }
    });

    // ============================================================
    // 📥 OFFER
    // ============================================================
    socket.on('offer', async (data) => {
      console.log('📥 OFFER recibido de', data.fromUserId);
      let pc = peerConnectionsRef.current.get(data.fromUserId);

      if (!pc) {
        console.log(`   → Creando nueva RTCPeerConnection para ${data.fromUserId}`);
        pc = new RTCPeerConnection({
          iceServers: iceServersRef.current,
        });
        peerConnectionsRef.current.set(data.fromUserId, pc);

        if (localStreamRef.current) {
          console.log(`   → Agregando tracks locales a ${data.fromUserId}`);
          localStreamRef.current.getTracks().forEach((track) => {
            pc!.addTrack(track, localStreamRef.current!);
            console.log(`      ✓ Track agregado: ${track.kind}`);
          });
        } else {
          console.warn(`   ⚠️ NO HAY STREAM LOCAL para agregar tracks`);
        }
      }

      pc.ontrack = (event) => {
        console.log('🎥 ontrack recibido en OFFER handler de', data.fromUserId);
        console.log('   → event.streams:', event.streams);
        console.log('   → event.track:', event.track.kind, '(' + event.track.label + ')');

        // Obtener información del participante si existe
        const participant = participantsRef.current.find((p) => p.userId === data.fromUserId);

        setRemoteStreams((prev) => {
          const exists = prev.find((s) => s.userId === data.fromUserId);
          const base: RemoteStream = {
            userId: data.fromUserId,
            stream: event.streams[0],
            audio: participant?.audio ?? true,
            video: participant?.video ?? true,
            screen: participant?.screen ?? false,
            name: participant?.name || undefined,
            lastName: participant?.lastName || undefined,
            username: participant?.username || undefined,
            avatar: participant?.avatar || undefined,
          };

          if (exists) {
            console.log('   → Actualizando stream existente');
            return prev.map((s) => (s.userId === data.fromUserId ? { ...s, ...base } : s));
          }

          console.log('   → Añadiendo nuevo stream remoto');
          return [...prev, base];
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate)
          socket.emit('iceCandidate', {
            roomId,
            targetUserId: data.fromUserId,
            candidate: event.candidate,
          });
      };

      // Agregar listeners de estado
      pc.onconnectionstatechange = () => {
        console.log(`❇️ Connection state con ${data.fromUserId}:`, pc!.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`❇️ ICE connection state con ${data.fromUserId}:`, pc!.iceConnectionState);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      console.log(`   → Remote description establecida para ${data.fromUserId}`);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log(`   → Answer creado y local description establecida`);

      socket.emit('answer', {
        roomId,
        targetUserId: data.fromUserId,
        sdp: answer,
      });
      console.log(`   → Answer enviado a ${data.fromUserId}`);
    });

    // ============================================================
    // 📥 ANSWER
    // ============================================================
    socket.on('answer', async (data) => {
      console.log('📥 ANSWER recibido de', data.fromUserId);
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        // IMPORTANTE: Asegurar que ontrack esté configurado ANTES de setRemoteDescription
        if (!pc.ontrack) {
          pc.ontrack = (event) => {
            console.log('🎥 ontrack en ANSWER handler de', data.fromUserId, 'stream tracks:', event.streams[0]?.getTracks().length);

            const participant = participantsRef.current.find((p) => p.userId === data.fromUserId);

            setRemoteStreams((prev) => {
              const exists = prev.find((s) => s.userId === data.fromUserId);
              const base: RemoteStream = {
                userId: data.fromUserId,
                stream: event.streams[0],
                audio: participant?.audio ?? true,
                video: participant?.video ?? true,
                screen: participant?.screen ?? false,
                name: participant?.name || undefined,
                lastName: participant?.lastName || undefined,
                username: participant?.username || undefined,
                avatar: participant?.avatar || undefined,
              };

              if (exists) return prev.map((s) => (s.userId === data.fromUserId ? { ...s, ...base } : s));

              return [...prev, base];
            });
          };
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    // ============================================================
    // 🧊 ICE CANDIDATE
    // ============================================================
    socket.on('iceCandidate', async (data) => {
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // ============================================================
    // 📢 USER MEDIA CHANGED
    // ============================================================
    socket.on('userMediaChanged', (data) => {
      console.log(`Media changed para ${data.userId}:`, data);

      updateParticipants((prev) =>
        prev.map((p) =>
          p.userId === data.userId
            ? {
                ...p,
                audio: data.audio !== undefined ? data.audio : p.audio,
                video: data.video !== undefined ? data.video : p.video,
                screen: data.screen !== undefined ? data.screen : p.screen,
              }
            : p
        )
      );

      setRemoteStreams((prev) =>
        prev.map((s) =>
          s.userId === data.userId
            ? {
                ...s,
                audio: data.audio !== undefined ? data.audio : s.audio,
                video: data.video !== undefined ? data.video : s.video,
                screen: data.screen !== undefined ? data.screen : s.screen,
              }
            : s
        )
      );
    });

    // ============================================================
    // 👋 USER LEFT
    // ============================================================
    socket.on('userLeft', (data) => {
      console.log(`Usuario ${data.userId} se desconectó`);

      const pc = peerConnectionsRef.current.get(data.userId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(data.userId);
      }

      updateParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      setRemoteStreams((prev) => prev.filter((s) => s.userId !== data.userId));

      onUserLeft?.(data.userId);
    });

    // CLEANUP
    return () => {
      socket.disconnect();
    };
  }, [token, roomId, API_URL, onUserLeft, onUserJoined]);

  // ============================================================
  // 🔘 JOIN ROOM
  // ============================================================
  const joinRoom = useCallback(async () => {
    if (!socketRef.current?.connected) {
      onError?.('No estás conectado al servidor');
      return;
    }

    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch {
        onError?.('No se pudo acceder a la cámara/micrófono');
      }
    }

    socketRef.current.emit('joinRoom', {
      roomId,
      audio: mediaState.audio,
      video: mediaState.video,
    });
  }, [roomId, mediaState, onError]);

  // ============================================================
  // 🚪 LEAVE ROOM
  // ============================================================
  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('leaveRoom', { roomId });

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setIsInRoom(false);
    setParticipants([]);
    setRemoteStreams([]);
  }, [roomId]);

  // ============================================================
  // 🎤 AUDIO
  // ============================================================
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;

    const enabled = !mediaState.audio;

    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = enabled));

    setMediaState((prev) => ({ ...prev, audio: enabled }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleAudio', {
        roomId,
        enabled,
      });
    }
  }, [mediaState.audio, isInRoom, roomId]);

  // ============================================================
  // 🎥 VIDEO
  // ============================================================
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;

    const enabled = !mediaState.video;

    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = enabled));

    setMediaState((prev) => ({ ...prev, video: enabled }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleVideo', {
        roomId,
        enabled,
      });
    }
  }, [mediaState.video, isInRoom, roomId]);

  // ============================================================
  // 🖥️ SCREEN SHARE
  // ============================================================
  const toggleScreenShare = useCallback(async () => {
    if (!socketRef.current || !localStreamRef.current) return;

    const enabled = !mediaState.screen;

    if (enabled) {
      // Iniciar compartir pantalla
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
          } as any,
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Reemplazar el track de video en todas las peer connections
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Reemplazar el track local
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldVideoTrack);
        localStreamRef.current.addTrack(screenTrack);

        // Guardar referencia al track de cámara original
        oldVideoTrack.stop();

        // Actualizar estado
        setMediaState((prev) => ({ ...prev, screen: true, video: false }));
        setLocalStream(localStreamRef.current);

        // Detectar cuando el usuario detiene la compartición desde el navegador
        screenTrack.onended = async () => {
          await stopScreenShare();
        };

        // Notificar al servidor
        if (isInRoom) {
          socketRef.current.emit('toggleScreenShare', {
            roomId,
            enabled: true,
          });
        }
      } catch (error) {
        console.error('Error al compartir pantalla:', error);
      }
    } else {
      await stopScreenShare();
    }
  }, [mediaState.screen, isInRoom, roomId]);

  // Helper para detener compartir pantalla
  const stopScreenShare = useCallback(async () => {
    if (!localStreamRef.current || !socketRef.current) return;

    try {
      // Obtener nuevo stream de cámara
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false, // No reemplazamos audio
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];

      // Reemplazar el track en todas las peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      });

      // Detener el track de pantalla actual
      const screenTrack = localStreamRef.current.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.stop();
        localStreamRef.current.removeTrack(screenTrack);
      }

      // Agregar el nuevo track de cámara
      localStreamRef.current.addTrack(cameraTrack);

      // Actualizar estado
      setMediaState((prev) => ({ ...prev, screen: false, video: true }));
      setLocalStream(localStreamRef.current);

      // Notificar al servidor
      if (isInRoom) {
        socketRef.current.emit('toggleScreenShare', {
          roomId,
          enabled: false,
        });
      }
    } catch (error) {
      console.error('Error al detener compartir pantalla:', error);
    }
  }, [isInRoom, roomId]);

  // ============================================================
  // RETURN API
  // ============================================================
  return {
    isConnected,
    isInRoom,
    localStream,
    remoteStreams,
    participants,
    mediaState,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
