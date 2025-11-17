import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CohorteAnnouncement } from '@/services/cohorteService';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UseCohorteAnnouncementsProps {
  cohorteId: string | null;
  token: string | null;
  enabled?: boolean;
}

export function useCohorteAnnouncements({ cohorteId, token, enabled = true }: UseCohorteAnnouncementsProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Conectar al socket
  useEffect(() => {
    if (!enabled || !token || !cohorteId) {
      if (socketRef.current) {
        console.log('🔌 Desconectando socket de cohorte announcements...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    console.log('🔌 Conectando al socket de cohorte announcements...');
    const socket = io(`${SOCKET_URL}/cohorte-announcement`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket de announcements conectado:', socket.id);
      setIsConnected(true);

      // Unirse automáticamente a la sala del cohorte
      socket.emit('joinCohorte', { cohorteId });
      console.log('📥 Uniéndose a sala de cohorte:', cohorteId);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket de announcements desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ WebSocket de announcements no disponible');
      }
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpiando socket de announcements...');
      if (socket.connected) {
        socket.emit('leaveCohorte', { cohorteId });
      }
      socket.disconnect();
    };
  }, [token, enabled, cohorteId]);

  // Escuchar nuevos anuncios
  const onNewAnnouncement = useCallback((callback: (announcement: CohorteAnnouncement) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (announcement: CohorteAnnouncement) => {
      console.log('📢 Nuevo anuncio recibido:', announcement);
      callback(announcement);
    };

    socketRef.current.on('cohorte.announcement.created', handler);
    return () => {
      socketRef.current?.off('cohorte.announcement.created', handler);
    };
  }, []);

  return {
    isConnected,
    onNewAnnouncement,
  };
}
