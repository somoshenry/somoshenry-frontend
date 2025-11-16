'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LiveClassRoom } from '@/components/LiveClass/LiveClassRoom';
import { webrtcService } from '@/services/webrtcService';
import { Room } from '@/types/webrtc.types';

export default function LiveClassPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 FIX: leer token correctamente
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token') || '';
      setToken(t); // 👉 Ahora sí dispara re-render
    }
  }, []);

  // Cargar la sala
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const roomData = await webrtcService.getRoom(roomId);
        setRoom(roomData);
      } catch (err) {
        setError('No se pudo cargar la información de la clase');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Cargando clase...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar la clase'}</p>
          <a href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <LiveClassRoom
      roomId={roomId}
      token={token}
      classInfo={{
        name: room.name,
        description: room.description || 'Clase en vivo',
        time: new Date(room.createdAt).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        instructor: {
          name: 'Prof. María García',
          title: 'Especialista en React',
        },
      }}
    />
  );
}
