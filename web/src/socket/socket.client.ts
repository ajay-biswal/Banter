import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

// Create exactly ONE Socket.IO client instance (singleton)
export const socket: Socket = io((env.API_BASE_URL || '').replace('/api', ''), {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
});

// Export the socket instance
export default socket;