"use client";
// que estoy haciendo como qu esto no funciona?

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {webrtcService} from "@/services/webrtcService";
import {Room} from "@/types/webrtc.types";
import {Loader2, Plus, LogIn} from "lucide-react";

export const LiveRoomMenu = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
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
      console.error("Error al cargar salas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    sessionStorage.setItem("currentRoom", JSON.stringify({id: roomId}));
    router.push(`/live/${roomId}`);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert("El nombre de la sala es obligatorio");
      return;
    }

    try {
      setCreatingRoom(true);
      const room = await webrtcService.createRoom(newRoomName, newRoomDescription);
      sessionStorage.setItem("currentRoom", JSON.stringify(room));
      router.push(`/live/${room.id}`);
    } catch (error) {
      console.error("Error al crear sala:", error);
      alert("Error al crear la sala");
    } finally {
      setCreatingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:text-white text-black dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#ffff00] animate-spin" />
          <p className="text-white text-lg">Cargando salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-0 md:left-64 right-0 bottom-0  bg-white dark:bg-gray-900 dark:text-white text-black  overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header centrado */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-white text-black">Videollamadas en vivo</h1>
          <p className="text-gray-400 text-lg">Únete a una sala existente o crea una nueva para comenzar</p>
        </div>

        {/* Botón para crear - centrado */}
        {!showCreateForm && (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-[#ffff00]  text-black font-bold rounded-lg flex items-center gap-3 transition-all hover:scale-105 shadow-lg cursor-pointer"
            >
              <Plus size={24} />
              Crear nueva sala
            </button>
          </div>
        )}

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="max-w-2xl mx-auto mb-12 p-8 dark:bg-gray-800  bg-gray-100  dark:text-white text-black rounded-xl dark:border dark:border-gray-700 shadow-2xl border border-[#ffff00]">
            <h2 className="text-2xl font-bold mb-6 text-center">Crear nueva sala</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre de la sala</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Ej: Clase de WebRTC"
                  className="w-full px-4 py-3 bg-gray-700 border dark:text-white  dark:border dark:border-gray-600 rounded-lg placeholder-gray-500 focus:border-[#ffff00] text-black focus:outline-none transition dark:focus:border-[#ffff00] dark:focus:outline-none dark:transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descripción (opcional)</label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Ej: Clase de WebRTC y Socket.io"
                  rows={3}
                  className="w-full px-4 py-3 bg-bl  bg-gray-700 border dark:text-white  dark:border text-black dark:border-gray-600 rounded-lg  placeholder-gray-500 focus:border-[#ffff00] focus:outline-none transition dark:focus:border-[#ffff00] dark:focus:outline-none dark:transition"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCreateRoom}
                  disabled={creatingRoom}
                  className="flex-1 px-6 py-3 bg-[#ffff00] text-black  font-bold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-all hover:scale-105 cursor-pointer"
                >
                  {creatingRoom ? "Creando..." : "Crear sala"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewRoomName("");
                    setNewRoomDescription("");
                  }}
                  className="flex-1 px-6 py-3 bg-red-400 coursor cursor-pointer text-black font-bold rounded-lg transition-all hover:scale-105"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de salas */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Salas disponibles</h2>

          {rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gray-100 text-black dark:bg-gray-800 dark:text-white rounded-lg border border-[#ffff00] dark:border-gray-700 shadow-2xl">
                <p className=" text-xl mb-2">No hay salas disponibles en este momento</p>
                <p className="">Crea una nueva para empezar</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-6 bg-gray-100 text-black  rounded-xl shadow-md/30 shadow-black transition-all hover:shadow-xl hover:shadow-[#ffff00] hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold mb-2 ">{room.name}</h3>
                  {room.description && <p className="mb-2 line-clamp-2">{room.description}</p>}

                  <div className="mb-6 flex gap-4 text-sm  py-3 border-t border-b border-gray-700">
                    <span className="flex items-center gap-1">
                      👥 <span className="font-semibold ">{room.currentParticipants || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      📊 Máx: <span className="font-semibold ">{room.maxParticipants || 10}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="w-full px-4 py-3 bg-[#ffff00] cursor-pointer text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                  >
                    <LogIn size={20} />
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
