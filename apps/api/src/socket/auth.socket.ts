import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/paseto.js';
import cookie from 'cookie';

/**
 * Authenticate socket connection using PASETO access token from cookies
 */
export const authenticateSocket = async (socket: Socket): Promise<any> => {
  try {
    // Extract cookies from handshake headers
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const accessToken = cookies.access_token;

    if (!accessToken) {
      throw new Error('Access token not found in cookies');
    }

    // Verify the access token using existing PASETO logic
    const userData = await verifyAccessToken(accessToken);

    return userData;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};