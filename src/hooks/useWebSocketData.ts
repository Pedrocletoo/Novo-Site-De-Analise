import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessage } from '../services/websocket';
import { apiService, IMatch } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';

interface WebSocketDataHookOptions {
  channel: string;
  initialData?: IMatch[];
  fallbackPolling?: boolean;
  pollingInterval?: number;
}

interface WebSocketDataHookReturn {
  data: IMatch[];
  loading: boolean;
  error: Error | null;
  isLive: boolean;
  lastUpdated: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  refresh: () => Promise<void>;
}

/**
 * Hook para obter dados via WebSocket com fallback para polling quando necessário
 * Usa o WebSocketContext para gerenciar a conexão
 * 
 * @param options Opções de configuração do hook
 * @returns Estado dos dados e conexão
 */
export function useWebSocketData({
  channel,
  initialData = [],
  fallbackPolling = true,
  pollingInterval = 6000
}: WebSocketDataHookOptions): WebSocketDataHookReturn {
  // Estado dos dados
  const [data, setData] = useState<IMatch[]>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Referencias para controle interno
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Obter estado da conexão WebSocket do contexto
  const { connectionState, subscribe, unsubscribe } = useWebSocket();
  
  /**
   * Função para carregar dados da API REST (usado para carga inicial ou fallback)
   */
  const fetchDataFromApi = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;
    
    if (isInitialLoadRef.current) {
      setLoading(true);
    }
    
    try {
      const fetchedData = await apiService.getMatches(channel, '480');
      
      if (!isMountedRef.current) return;
      
      setData(fetchedData);
      setLastUpdated(new Date());
      setLoading(false);
      isInitialLoadRef.current = false;
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('Erro ao buscar dados via API REST:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados'));
      setLoading(false);
    }
  }, [channel]);
  
  /**
   * Manipula mensagens recebidas do WebSocket
   */
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (!isMountedRef.current) return;
    
    if (message.type === 'match_update' && message.payload) {
      // Atualiza os dados com as novas informações
      const updatedMatches = message.payload as IMatch[];
      
      // Merge com dados existentes ou substituição completa
      if (Array.isArray(updatedMatches)) {
        if (updatedMatches.length > 0) {
          setData(prevData => {
            // Se for uma atualização completa, substituir todos os dados
            if (updatedMatches.length >= prevData.length) {
              return updatedMatches;
            }
            
            // Se for atualização parcial, mesclar com os dados atuais
            const matchMap = new Map<string, IMatch>();
            
            // Primeiro adicionar todos os dados existentes
            prevData.forEach(match => {
              matchMap.set(match.id, match);
            });
            
            // Depois sobrescrever com atualizações
            updatedMatches.forEach(match => {
              matchMap.set(match.id, match);
            });
            
            return Array.from(matchMap.values());
          });
          
          setLastUpdated(new Date());
        }
      }
    } else if (message.type === 'error') {
      console.error('Erro recebido do WebSocket:', message.payload);
      setError(new Error(message.payload?.message || 'Erro no servidor'));
    }
  }, []);
  
  /**
   * Configura o polling como fallback
   */
  const setupPolling = useCallback(() => {
    // Limpar timer existente
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // Não configurar polling se fallback não estiver ativado
    if (!fallbackPolling) {
      return;
    }
    
    // Configurar novo timer apenas se não estivermos conectados via WebSocket
    if (connectionState !== 'connected') {
      pollingTimerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          console.log('Usando polling como fallback para WebSocket');
          fetchDataFromApi().catch(err => {
            console.error('Erro durante polling de fallback:', err);
          });
        }
      }, pollingInterval);
    }
    
    // Função de limpeza
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [connectionState, fallbackPolling, fetchDataFromApi, pollingInterval]);
  
  /**
   * Função pública para forçar atualização dos dados
   */
  const refresh = useCallback(async (): Promise<void> => {
    return fetchDataFromApi();
  }, [fetchDataFromApi]);
  
  /**
   * Efeito para inicializar dados e configurar inscrição no WebSocket
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    // Inscrever no canal WebSocket
    subscribe(channel);
    
    // Carregar dados iniciais via API REST
    fetchDataFromApi().catch(console.error);
    
    // Configurar polling como fallback se necessário
    const cleanupPolling = setupPolling();
    
    return () => {
      isMountedRef.current = false;
      
      // Remover inscrição
      unsubscribe(channel);
      
      // Limpar polling
      if (cleanupPolling) cleanupPolling();
    };
  }, [channel, fetchDataFromApi, setupPolling, subscribe, unsubscribe]);
  
  /**
   * Efeito para reagir às mudanças no status da conexão
   */
  useEffect(() => {
    // Ajustar o polling baseado no status da conexão
    setupPolling();
  }, [connectionState, setupPolling]);
  
  return {
    data,
    loading,
    error,
    isLive: connectionState === 'connected',
    lastUpdated,
    connectionStatus: connectionState,
    refresh
  };
} 