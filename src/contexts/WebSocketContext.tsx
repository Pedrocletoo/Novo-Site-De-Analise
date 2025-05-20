import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { websocketService } from '../services/websocket';

interface WebSocketContextProps {
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastActivity: Date | null;
  reconnect: () => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const initialState: WebSocketContextProps = {
  connectionState: 'disconnected',
  lastActivity: null,
  reconnect: () => {},
  subscribe: () => {},
  unsubscribe: () => {}
};

export const WebSocketContext = createContext<WebSocketContextProps>(initialState);

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  autoConnect = true 
}) => {
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>(
    websocketService.isConnected() ? 'connected' : 'disconnected'
  );
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  // Gerenciar o ciclo de vida do WebSocket
  useEffect(() => {
    const onConnect = () => {
      setConnectionState('connected');
      setLastActivity(new Date());
    };

    const onDisconnect = () => {
      setConnectionState('disconnected');
    };

    const onError = () => {
      setConnectionState('error');
    };

    const onMessage = () => {
      setLastActivity(new Date());
    };

    // Registrar listeners
    websocketService.on('connected', onConnect);
    websocketService.on('disconnected', onDisconnect);
    websocketService.on('error', onError);
    websocketService.on('message', onMessage);

    // Conectar automaticamente se necessário
    if (autoConnect && !websocketService.isConnected()) {
      setConnectionState('connecting');
      websocketService.connect();
    }

    // Limpar na desmontagem
    return () => {
      websocketService.off('connected', onConnect);
      websocketService.off('disconnected', onDisconnect);
      websocketService.off('error', onError);
      websocketService.off('message', onMessage);
    };
  }, [autoConnect]);

  // Funções do contexto
  const reconnect = () => {
    setConnectionState('connecting');
    websocketService.connect();
  };

  const subscribe = (channel: string) => {
    websocketService.subscribe(channel);
  };

  const unsubscribe = (channel: string) => {
    websocketService.unsubscribe(channel);
  };

  // Valor do contexto
  const contextValue: WebSocketContextProps = {
    connectionState,
    lastActivity,
    reconnect,
    subscribe,
    unsubscribe
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}; 