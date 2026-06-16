import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../lib/api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutsRef = useRef({});
  const messageCallbackRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 600,
      reconnectionDelayMax: 5000,
      timeout: 12000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('message:receive', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (messageCallbackRef.current) {
        messageCallbackRef.current(msg);
      }
    });

    newSocket.on('message:sent', (msg) => {
      setMessages((prev) => {
        if (msg.clientMessageId) {
          return prev.map((item) => (
            item.clientMessageId === msg.clientMessageId ? msg : item
          ));
        }
        if (prev.some(p => p._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('message:typing', ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
      }
      typingTimeoutsRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off();
      newSocket.disconnect();
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [token, user?.id]);

  const sendMessage = (receiverId, content, conversationId, clientMessageId) => {
    if (socket) {
      socket.emit('message:send', { receiverId, content, conversationId, clientMessageId });
    }
  };

  const sendTyping = (receiverId) => {
    if (socket) {
      socket.emit('message:typing', { receiverId });
    }
  };

  const markSeen = (conversationId) => {
    if (socket) {
      socket.emit('message:seen', { conversationId });
    }
  };

  const registerOnMessage = (callback) => {
    messageCallbackRef.current = callback;
    return () => {
      if (messageCallbackRef.current === callback) {
        messageCallbackRef.current = null;
      }
    };
  };

  return (
    <SocketContext.Provider value={{
      socket,
      messages,
      setMessages,
      typingUsers,
      sendMessage,
      sendTyping,
      markSeen,
      registerOnMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
