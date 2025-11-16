// src/types/webrtc.types.ts

export interface Participant {
  userId: string;
  socketId?: string;
  audio: boolean;
  video: boolean;
  screen: boolean;
  joinedAt?: Date;
  name?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatar?: string | null;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  maxParticipants: number;
  participantsCount: number;
  participants?: Participant[];
  createdAt: string;
  isFull: boolean;
}

export interface WebRTCSignal {
  roomId: string;
  targetUserId: string;
  type: 'offer' | 'answer';
  sdp: RTCSessionDescriptionInit;
}

export interface IceCandidate {
  roomId: string;
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface JoinRoomPayload {
  roomId: string;
  audio?: boolean;
  video?: boolean;
}

export interface UserMediaState {
  audio: boolean;
  video: boolean;
  screen: boolean;
}

export interface RemoteStream {
  userId: string;
  stream: MediaStream;
  audio: boolean;
  video: boolean;
  screen: boolean;
  name?: string;
  lastName?: string;
  username?: string;
  avatar?: string | null;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }, { urls: 'stun:stun3.l.google.com:19302' }, { urls: 'stun:stun4.l.google.com:19302' }];
