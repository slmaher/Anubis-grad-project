import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAuthToken } from '../api/authStorage';

// For mobile/emulator development, you might need to use your machine's IP address
// const SOCKET_URL = 'http://192.168.x.x:4000';
const SOCKET_URL = 'http://localhost:4000';

export const useChatSocket = (onNewMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      const token = await getAuthToken();
      if (!token || !isMounted) return;

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketRef.current.on('new_message', (message) => {
        if (onNewMessage) {
          onNewMessage(message);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onNewMessage]);

  return socketRef.current;
};
