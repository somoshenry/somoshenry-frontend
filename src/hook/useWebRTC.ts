// src/hook/useWebRTC.ts

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

  // ================================================================
  // 🔌 CONEXIÓN SOCKET.IO
  // ================================================================
  useEffect(() => {
    if (!token) return;

    const socket = io(`${API_URL}/webrtc`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsInRoom(false);
    });

    // ================================================================
    // 🟢 JOINED ROOM
    // ================================================================
    socket.on('joinedRoom', async (data) => {
      setIsInRoom(true);
      setParticipants(data.participants || []);

      // Iniciar stream local si no está activo
      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
        } catch (error) {
          onError?.('No se pudo acceder a la cámara/micrófono');
          return;
        }
      }

      // Crear conexiones con participantes actuales
      data.participants?.forEach((participant: Participant) => {
        if (participant.userId !== data.userId) {
          const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
          }

          pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.emit('iceCandidate', {
                roomId,
                targetUserId: participant.userId,
                candidate: event.candidate,
              });
            }
          };

          pc.ontrack = (event) => {
            setRemoteStreams((prev) => {
              const exists = prev.find((s) => s.userId === participant.userId);

              const base = {
                userId: participant.userId,
                stream: event.streams[0],
                audio: participant.audio,
                video: participant.video,
                screen: participant.screen,
                name: participant.name,
                lastName: participant.lastName,
                username: participant.username,
                avatar: participant.avatar ?? null,
              };

              if (exists) {
                return prev.map((s) => (s.userId === participant.userId ? { ...s, ...base } : s));
              }

              return [...prev, base];
            });
          };

          pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
              pc.close();
              peerConnectionsRef.current.delete(participant.userId);
              setRemoteStreams((prev) => prev.filter((s) => s.userId !== participant.userId));
            }
          };

          peerConnectionsRef.current.set(participant.userId, pc);

          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit('offer', {
                roomId,
                targetUserId: participant.userId,
                type: 'offer',
                sdp: pc.localDescription,
              });
            });
        }
      });
    });

    // ================================================================
    // 👤 USER JOINED
    // ================================================================
    socket.on('userJoined', (data) => {
      onUserJoined?.(data.userId);
      setParticipants((prev) => [...prev, data]);

      const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('iceCandidate', {
            roomId,
            targetUserId: data.userId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const exists = prev.find((s) => s.userId === data.userId);

          const base = {
            userId: data.userId,
            stream: event.streams[0],
            audio: data.audio,
            video: data.video,
            screen: data.screen,
            name: data.name,
            lastName: data.lastName,
            username: data.username,
            avatar: data.avatar ?? null,
          };

          if (exists) {
            return prev.map((s) => (s.userId === data.userId ? { ...s, ...base } : s));
          }

          return [...prev, base];
        });
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          pc.close();
          peerConnectionsRef.current.delete(data.userId);
          setRemoteStreams((prev) => prev.filter((s) => s.userId !== data.userId));
        }
      };

      peerConnectionsRef.current.set(data.userId, pc);
    });

    // ================================================================
    // 👋 USER LEFT
    // ================================================================
    socket.on('userLeft', (data) => {
      onUserLeft?.(data.userId);
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      peerConnectionsRef.current.get(data.userId)?.close();
      peerConnectionsRef.current.delete(data.userId);
      setRemoteStreams((prev) => prev.filter((s) => s.userId !== data.userId));
    });

    // ================================================================
    // 📥 OFFER
    // ================================================================
    socket.on('offer', async (data) => {
      let pc = peerConnectionsRef.current.get(data.fromUserId);

      if (!pc) {
        pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => pc!.addTrack(track, localStreamRef.current!));
        }

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('iceCandidate', {
              roomId: data.roomId,
              targetUserId: data.fromUserId,
              candidate: event.candidate,
            });
          }
        };

        pc.ontrack = (event) => {
          setRemoteStreams((prev) => {
            const exists = prev.find((s) => s.userId === data.fromUserId);

            const base = {
              userId: data.fromUserId,
              stream: event.streams[0],
              audio: true,
              video: true,
              screen: false,
              name: data.name,
              lastName: data.lastName,
              username: data.username,
              avatar: data.avatar ?? null,
            };

            if (exists) {
              return prev.map((s) => (s.userId === data.fromUserId ? { ...s, ...base } : s));
            }

            return [...prev, base];
          });
        };

        pc.oniceconnectionstatechange = () => {
          if (pc!.iceConnectionState === 'disconnected' || pc!.iceConnectionState === 'failed') {
            pc!.close();
            peerConnectionsRef.current.delete(data.fromUserId);
            setRemoteStreams((prev) => prev.filter((s) => s.userId !== data.fromUserId));
          }
        };

        peerConnectionsRef.current.set(data.fromUserId, pc);
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

    // ================================================================
    // 📥 ANSWER
    // ================================================================
    socket.on('answer', async (data) => {
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    // ================================================================
    // 🧊 ICE CANDIDATE
    // ================================================================
    socket.on('iceCandidate', async (data) => {
      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // ================================================================
    // 🎬 MEDIA STATE
    // ================================================================
    socket.on('userMediaChanged', (data) => {
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
      onError?.(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, API_URL, roomId]);

  // ================================================================
  // 🔘 JOIN ROOM
  // ================================================================
  const joinRoom = useCallback(async () => {
    if (!socketRef.current?.connected) {
      onError?.('No estás conectado al servidor');
      return;
    }

    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
      }

      socketRef.current.emit('joinRoom', {
        roomId,
        audio: mediaState.audio,
        video: mediaState.video,
      });
    } catch {
      onError?.('Error al unirse a la sala');
    }
  }, [roomId, mediaState, onError]);

  // ================================================================
  // 🚪 LEAVE ROOM
  // ================================================================
  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('leaveRoom', { roomId });

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setIsInRoom(false);
    setRemoteStreams([]);
    setParticipants([]);
    setMediaState({ audio: true, video: true, screen: false });
  }, [roomId]);

  // ================================================================
  // 🎤 AUDIO
  // ================================================================
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;

    const newState = !mediaState.audio;
    localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = newState));

    setMediaState((prev) => ({ ...prev, audio: newState }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleAudio', {
        roomId,
        enabled: newState,
      });
    }
  }, [mediaState.audio, roomId, isInRoom]);

  // ================================================================
  // 🎥 VIDEO
  // ================================================================
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;

    const newState = !mediaState.video;
    localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = newState));

    setMediaState((prev) => ({ ...prev, video: newState }));

    if (socketRef.current && isInRoom) {
      socketRef.current.emit('toggleVideo', {
        roomId,
        enabled: newState,
      });
    }
  }, [mediaState.video, roomId, isInRoom]);

  // ================================================================
  // 🖥️ SCREEN SHARE
  // ================================================================
  const toggleScreenShare = useCallback(async () => {
    const newState = !mediaState.screen;

    if (newState) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        const newStream = new MediaStream([screenTrack, ...(localStreamRef.current?.getAudioTracks() || [])]);

        setLocalStream(newStream);

        screenTrack.onended = () => toggleScreenShare();

        setMediaState((prev) => ({ ...prev, screen: true }));

        if (socketRef.current && isInRoom) {
          socketRef.current.emit('toggleScreenShare', {
            roomId,
            enabled: true,
          });
        }
      } catch {
        onError?.('No se pudo compartir pantalla');
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });

        setLocalStream(localStreamRef.current);
      }

      setMediaState((prev) => ({ ...prev, screen: false }));

      if (socketRef.current && isInRoom) {
        socketRef.current.emit('toggleScreenShare', {
          roomId,
          enabled: false,
        });
      }
    }
  }, [mediaState.screen, roomId, isInRoom, onError]);

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
