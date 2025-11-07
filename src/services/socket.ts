import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export const connectSocket = (): Socket => {
  const token = localStorage.getItem('token');
  return io(API_URL, {
    transports: ['websocket'],
    auth: { token },
  });
};
