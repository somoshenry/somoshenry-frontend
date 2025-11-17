// src/services/webrtcService.ts

import { Room } from '@/types/webrtc.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class WebRTCService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    // Ajusta según tu implementación
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async createRoom(name: string, description?: string, maxParticipants = 10): Promise<Room> {
    const response = await fetch(`${API_URL}/webrtc/rooms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, description, maxParticipants }),
    });

    if (!response.ok) {
      throw new Error('Error al crear sala');
    }

    return response.json();
  }

  async getRooms(): Promise<Room[]> {
    const response = await fetch(`${API_URL}/webrtc/rooms`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener salas');
    }

    return response.json();
  }

  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`${API_URL}/webrtc/rooms/${roomId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener sala');
    }

    return response.json();
  }

  async deleteRoom(roomId: string): Promise<void> {
    const response = await fetch(`${API_URL}/webrtc/rooms/${roomId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar sala');
    }
  }

  async getIceServers(): Promise<{ iceServers: RTCIceServer[] }> {
    const response = await fetch(`${API_URL}/webrtc/ice-servers`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener ICE servers');
    }

    return response.json();
  }
}

export const webrtcService = new WebRTCService();
