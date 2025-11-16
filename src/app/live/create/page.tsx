'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { webrtcService } from '@/services/webrtcService';

export default function CreateLiveClassPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);

      const room = await webrtcService.createRoom(name, description);

      router.push(`/live/${room.id}`);
    } catch (error: any) {
      console.error(error);
      alert('Error al crear la clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-black">Crear clase en vivo</h1>

      <label className="block mb-2 font-semibold text-black">Nombre</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded mb-4 text-black" placeholder="Ej: Clase de WebRTC" />

      <label className="block mb-2 font-semibold text-black">Descripción</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded mb-6 text-black" placeholder="Ej: Llamada usando WebRTC" />

      <button onClick={handleCreate} disabled={loading} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded">
        {loading ? 'Creando...' : 'Crear clase'}
      </button>
    </div>
  );
}
