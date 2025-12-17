// WebSocket Hook - Provides WebSocket connection management
// Part of Bobby's World real-time communication layer

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WsMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface UseWsOptions {
  url?: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWsReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: WsMessage | null;
  bootforgeTail: string[];
  connect: () => void;
  disconnect: () => void;
  send: (message: WsMessage) => boolean;
}

export function useWs(options: UseWsOptions = {}): UseWsReturn {
  const {
    url = 'ws://localhost:3001/ws',
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [bootforgeTail, setBootforgeTail] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WsMessage;
          setLastMessage(message);

          // Handle bootforge tail messages
          if (message.type === 'bootforge:tail' || message.type === 'log') {
            setBootforgeTail(prev => {
              const newLogs = [...prev, message.payload?.message || String(message.payload)];
              // Keep last 1000 lines
              return newLogs.slice(-1000);
            });
          }
        } catch {
          // Handle non-JSON messages
          setBootforgeTail(prev => [...prev, event.data].slice(-1000));
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
    }
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, []);

  const send = useCallback((message: WsMessage): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    lastMessage,
    bootforgeTail,
    connect,
    disconnect,
    send,
  };
}
