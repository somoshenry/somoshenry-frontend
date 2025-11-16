'use client';
// que estoy haciendo como qu esto no funciona?

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webrtcService } from '@/services/webrtcService';
import { Room } from '@/types/webrtc.types';
import { Loader2, Plus, LogIn } from 'lucide-react';

export const LiveRoomMenu = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const fetchedRooms = await webrtcService.getRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Error al cargar salas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    sessionStorage.setItem('currentRoom', JSON.stringify({ id: roomId }));
    router.push(`/live/${roomId}`);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('El nombre de la sala es obligatorio');
      return;
    }

    try {
      setCreatingRoom(true);
      const room = await webrtcService.createRoom(newRoomName, newRoomDescription);
      sessionStorage.setItem('currentRoom', JSON.stringify(room));
      router.push(`/live/${room.id}`);
    } catch (error) {
      console.error('Error al crear sala:', error);
      alert('Error al crear la sala');
    } finally {
      setCreatingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#0d0f16]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
          <p className="text-white text-lg">Cargando salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#0d0f16] text-white overflow-hidden"
      style={{
        height: 'calc(100vh - 64px)',
        marginLeft: '240px',
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Clases en Vivo</h1>
          <p className="text-gray-400">Únete a una sala de videollamada o crea una nueva</p>
        </div>

        {/* Botón para crear */}
        {!showCreateForm && (
          <button onClick={() => setShowCreateForm(true)} className="mb-8 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg flex items-center gap-2 transition">
            <Plus size={20} />
            Crear nueva sala
          </button>
        )}

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="mb-8 p-6 bg-[#141722] rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Crear nueva sala</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre de la sala</label>
                <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Ej: Clase de WebRTC" className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descripción (opcional)</label>
                <textarea value={newRoomDescription} onChange={(e) => setNewRoomDescription(e.target.value)} placeholder="Ej: Clase de WebRTC y Socket.io" rows={3} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <button onClick={handleCreateRoom} disabled={creatingRoom} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg disabled:bg-gray-600 transition">
                  {creatingRoom ? 'Creando...' : 'Crear sala'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewRoomName('');
                    setNewRoomDescription('');
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de salas */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Salas disponibles</h2>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No hay salas disponibles en este momento</p>
              <p className="text-gray-500 mt-2">Crea una nueva para empezar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="p-6 bg-[#141722] rounded-lg border border-gray-700 hover:border-yellow-400 transition">
                  <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                  {room.description && <p className="text-gray-400 mb-4 line-clamp-2">{room.description}</p>}

                  <div className="mb-4 flex gap-4 text-sm text-gray-400">
                    <span>👥 {room.currentParticipants || 0} participantes</span>
                    <span>📊 Máx: {room.maxParticipants || 10}</span>
                  </div>

                  <button onClick={() => handleJoinRoom(room.id)} className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition">
                    <LogIn size={18} />
                    Unirse
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
