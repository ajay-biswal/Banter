import { io, Socket } from 'socket.io-client';

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, '');

if (!socketUrl) {
  throw new Error('NEXT_PUBLIC_SOCKET_URL or NEXT_PUBLIC_API_BASE_URL is required');
}

export const socket: Socket = io(socketUrl, {
  withCredentials: true,
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
});

export default socket;
