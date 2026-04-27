import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';

// Remove /api from base url for socket connection
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const useSocket = () => {
  const { token } = useSelector((s) => s.auth);
  const socketRef = useRef(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;
    forceUpdate((n) => n + 1); // trigger re-render so callers get the socket

    socket.on('connect_error', (err) => {
      console.log('Socket connect error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef.current;
};
