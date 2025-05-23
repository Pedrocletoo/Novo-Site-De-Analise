import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, IMatch } from '../services/api';

interface MatchDataHookReturn {
  matches: IMatch[];
  loading: boolean;
  error: Error | null;
  refetch: (liga?: string, result?: string) => Promise<void>;
  changeParams: (liga?: string, result?: string) => void;
  connected: boolean;
  lastUpdated: Date | null;
  refreshCount: number; // Contador de atualizações visível externamente
  isBackgroundRefreshing: boolean; // Flag para indicar refresh em segundo plano
}

/**
 * Hook personalizado para gerenciar dados de partidas da API
 * Inclui polling automático para manter os dados atualizados a cada 6 segundos
 * Implementa atualização silenciosa para não interromper a visualização do usuário
 * 
 * @param initialLiga - Liga inicial para buscar (padrão: 'euro')
 * @param initialResult - Parâmetro result inicial (padrão: '480')
 * @returns Objeto com dados das partidas, estado de carregamento, erro e funções para atualizar
 */
export function useMatchData(
  initialLiga: string = 'euro',
  initialResult: string = '480'
): MatchDataHookReturn {
  // Estados do hook
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState<boolean>(false);
  const [params, setParams] = useState({
    liga: initialLiga,
    result: initialResult
  });
  
  // Referências para controle interno
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const prevDataRef = useRef<IMatch[]>([]);
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Constantes
  const POLLING_INTERVAL = 2000; // 2 segundos (reduzido de 3000ms)
  const LOADING_DURATION = 0;  // Sem delay adicional na exibição do loading
  
  /**
   * Busca dados da API de forma memoizada
   */
  const fetchData = useCallback(async (isManualRefresh: boolean = false): Promise<void> => {
    // Não executar para componentes desmontados
    if (!isMountedRef.current) return;
    
    console.log(`[${new Date().toLocaleTimeString()}] Buscando dados... (${isManualRefresh ? 'manual' : 'automático'})`);
    
    // Se for a carga inicial ou refresh manual, mostrar o estado de carregamento
    // Caso contrário, usar o modo silencioso (background)
    if (isInitialLoadRef.current || isManualRefresh) {
      setLoading(true);
    } else {
      // Para atualizações automáticas, apenas indicar refresh em segundo plano
      setIsBackgroundRefreshing(true);
    }
    
    try {
      // Removido o delay intencional de 300ms
      
      // Executar a requisição à API
      const data = await apiService.getMatches(params.liga, params.result);
      
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      // Definir os dados e atualizar estado
      setMatches(data);
      setLastUpdated(new Date());
      setRefreshCount(prev => prev + 1);
      console.log(`[${new Date().toLocaleTimeString()}] Dados atualizados - total de itens: ${data.length}`);
      
      // Atualizar referência de dados anteriores
      prevDataRef.current = [...data];
      
      // Não é mais a carga inicial depois da primeira atualização
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      
      // Desativar estado de carregamento imediatamente
      setLoading(false);
      setIsBackgroundRefreshing(false);
      
    } catch (err) {
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      console.error('Erro ao buscar dados:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados'));
      
      // Desativar todos os estados de carregamento
      setLoading(false);
      setIsBackgroundRefreshing(false);
    }
  }, [params.liga, params.result]);
  
  /**
   * Função pública para recarregar dados manualmente
   */
  const refetch = useCallback(async (liga?: string, result?: string): Promise<void> => {
    // Atualizar parâmetros se fornecidos
    if (liga || result) {
      setParams({
        liga: liga || params.liga,
        result: result || params.result
      });
    }
    
    // Buscar dados - marcando como atualização manual
    await fetchData(true);
  }, [fetchData, params.liga, params.result]);
  
  /**
   * Função para alterar parâmetros de busca
   */
  const changeParams = useCallback((liga?: string, result?: string): void => {
    setParams({
      liga: liga || params.liga,
      result: result || params.result
    });
  }, [params.liga, params.result]);
  
  /**
   * Configura o mecanismo de polling automático
   */
  const setupPolling = useCallback(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Configurando polling automático a cada ${POLLING_INTERVAL/1000} segundos`);
    
    // Limpar timer anterior se existir
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // Criar novo timer de intervalo
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.log(`[${new Date().toLocaleTimeString()}] Executando polling agendado`);
        fetchData(false).catch(err => {
          console.error('Erro durante polling:', err);
        });
      }
    }, POLLING_INTERVAL);
    
    // Função de limpeza
    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] Limpando timer de polling`);
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [fetchData]);
  
  /**
   * Efeito principal - executa na montagem/desmontagem e quando parâmetros mudam
   */
  useEffect(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Inicializando hook useMatchData: ${params.liga}, ${params.result}`);
    isMountedRef.current = true;
    isInitialLoadRef.current = true;
    
    // Buscar dados imediatamente ao montar
    fetchData(false).catch(err => {
      console.error('Erro na carga inicial:', err);
    });
    
    // Configurar polling automático
    const cleanupPolling = setupPolling();
    
    // Limpeza na desmontagem
    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] Desmontando hook useMatchData`);
      isMountedRef.current = false;
      
      if (cleanupPolling) cleanupPolling();
    };
  }, [fetchData, setupPolling, params.liga, params.result]);
  
  /**
   * Efeito para reiniciar polling quando parâmetros mudam
   */
  useEffect(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Parâmetros alterados, recarregando dados`);
    isInitialLoadRef.current = true; // Tratar como carga inicial quando os parâmetros mudam
    fetchData(false).catch(err => {
      console.error('Erro ao recarregar após mudança de parâmetros:', err);
    });
  }, [params.liga, params.result, fetchData]);
  
  // Retornar objeto com dados e funções
  return {
    matches,
    loading,
    error,
    refetch,
    changeParams,
    connected: true,
    lastUpdated,
    refreshCount,
    isBackgroundRefreshing
  };
}

/**
 * Extrai informações de tempo de uma partida
 * 
 * @param match - Objeto da partida
 * @returns Objeto com hora e minuto formatados
 */
export function useMatchTime(match: IMatch | undefined) {
  if (!match) {
    return { hour: 0, minute: 0, formatted: '00:00' };
  }
  
  const { hour, minute } = apiService.extractTimeFromMatch(match.StartTime);
  
  // Formata para exibição com padding de zeros
  const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  return { hour, minute, formatted };
}

/**
 * Extrai informações de placar de uma partida
 * 
 * @param match - Objeto da partida
 * @returns Objeto com placares estruturados ou valores padrão se não disponível
 */
export function useMatchScore(match: IMatch | undefined) {
  if (!match) {
    return {
      fullTime: { home: 0, away: 0, formatted: '0-0' },
      halfTime: { home: 0, away: 0, formatted: '0-0' }
    };
  }
  
  const scores = apiService.getMatchScore(match);
  
  return {
    fullTime: {
      ...scores.fullTime,
      formatted: `${scores.fullTime.home}-${scores.fullTime.away}`
    },
    halfTime: {
      ...scores.halfTime,
      formatted: `${scores.halfTime.home}-${scores.halfTime.away}`
    }
  };
} 