import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, IMatch } from '../services/api';

interface CopaAmericaMatchDataHookReturn {
  matches: IMatch[];
  loading: boolean;
  error: Error | null;
  refetch: (liga?: string, result?: string) => Promise<void>;
  changeParams: (liga?: string, result?: string) => void;
  connected: boolean;
  lastUpdated: Date | null;
  refreshCount: number;
  isBackgroundRefreshing: boolean;
}

/**
 * Hook personalizado para gerenciar dados de partidas da Copa América
 * Inclui polling automático para manter os dados atualizados a cada 6 segundos
 * Implementa atualização silenciosa para não interromper a visualização do usuário
 * 
 * @param initialLiga - Liga inicial para buscar (padrão: 'copa-america')
 * @param initialResult - Parâmetro result inicial (padrão: '480')
 * @returns Objeto com dados das partidas, estado de carregamento, erro e funções para atualizar
 */
export function useCopaAmericaMatchData(
  initialLiga: string = 'copa-america',
  initialResult: string = '480'
): CopaAmericaMatchDataHookReturn {
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
  const POLLING_INTERVAL = 6000; // 6 segundos (alterado de 11000)
  const LOADING_DURATION = 800;  // duração visível do estado de carregamento
  
  /**
   * Busca dados da API de forma memoizada
   */
  const fetchData = useCallback(async (isManualRefresh: boolean = false): Promise<void> => {
    // Não executar para componentes desmontados
    if (!isMountedRef.current) return;
    
    console.log(`[Copa América][${new Date().toLocaleTimeString()}] Buscando dados... (${isManualRefresh ? 'manual' : 'automático'})`);
    
    // Se for a carga inicial ou refresh manual, mostrar o estado de carregamento
    // Caso contrário, usar o modo silencioso (background)
    if (isInitialLoadRef.current || isManualRefresh) {
      setLoading(true);
    } else {
      // Para atualizações automáticas, apenas indicar refresh em segundo plano
      setIsBackgroundRefreshing(true);
    }
    
    try {
      // Pequeno delay na carga inicial apenas (para mostrar feedback visual)
      if (isInitialLoadRef.current) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Executar a requisição à API
      const data = await apiService.getMatches(params.liga, params.result);
      
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      // Definir os dados e atualizar estado
      setMatches(data);
      setLastUpdated(new Date());
      setRefreshCount(prev => prev + 1);
      console.log(`[Copa América][${new Date().toLocaleTimeString()}] Dados atualizados - total de itens: ${data.length}`);
      
      // Atualizar referência de dados anteriores
      prevDataRef.current = [...data];
      
      // Não é mais a carga inicial depois da primeira atualização
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      
      // Desativar estado de carregamento - com delay para carga inicial ou manual,
      // imediatamente para refresh em segundo plano
      if (isManualRefresh) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setLoading(false);
          }
        }, LOADING_DURATION);
      } else {
        setLoading(false);
        setIsBackgroundRefreshing(false);
      }
      
    } catch (err) {
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      console.error('Erro ao buscar dados da Copa América:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados da Copa América'));
      
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
    console.log(`[Copa América][${new Date().toLocaleTimeString()}] Configurando polling automático a cada ${POLLING_INTERVAL/1000} segundos`);
    
    // Limpar timer anterior se existir
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // Criar novo timer de intervalo
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.log(`[Copa América][${new Date().toLocaleTimeString()}] Executando polling agendado`);
        fetchData(false).catch(err => {
          console.error('Erro durante polling da Copa América:', err);
        });
      }
    }, POLLING_INTERVAL);
    
    // Função de limpeza
    return () => {
      console.log(`[Copa América][${new Date().toLocaleTimeString()}] Limpando timer de polling`);
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
    console.log(`[Copa América][${new Date().toLocaleTimeString()}] Inicializando hook useCopaAmericaMatchData: ${params.liga}, ${params.result}`);
    isMountedRef.current = true;
    isInitialLoadRef.current = true;
    
    // Buscar dados imediatamente ao montar
    fetchData(false).catch(err => {
      console.error('Erro na carga inicial da Copa América:', err);
    });
    
    // Configurar polling automático
    const cleanupPolling = setupPolling();
    
    // Limpeza na desmontagem
    return () => {
      console.log(`[Copa América][${new Date().toLocaleTimeString()}] Desmontando hook useCopaAmericaMatchData`);
      isMountedRef.current = false;
      
      if (cleanupPolling) cleanupPolling();
    };
  }, [fetchData, setupPolling, params.liga, params.result]);
  
  // Calcular status de conexão com a API
  const connected = !error && !loading;
  
  return {
    matches,
    loading,
    error,
    refetch,
    changeParams,
    connected,
    lastUpdated,
    refreshCount,
    isBackgroundRefreshing
  };
} 