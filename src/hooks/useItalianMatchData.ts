import { useState, useEffect, useCallback, useRef } from 'react';
import { IMatch } from '../services/api';

// URL da API específica para o Campeonato Italiano
const ITALIAN_API_URL = 'https://easy-api-betano-fv.u6y5np.easypanel.host/api.php?liga=campeonato-Italiano&result=480';

/**
 * Hook personalizado para buscar dados da API do Campeonato Italiano
 * Retorna os dados formatados no mesmo padrão que o hook useMatchData
 * Implementa atualização silenciosa a cada 6 segundos igual ao comportamento da Euro League
 */
export const useItalianMatchData = () => {
  // Estados
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  
  // Referências para controle interno
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Constantes
  const POLLING_INTERVAL = 6000; // 6 segundos (alterado de 11000)
  const LOADING_DURATION = 800;  // duração visível do estado de carregamento
  
  /**
   * Função para buscar os dados da API
   */
  const fetchData = useCallback(async (isManualRefresh: boolean = false) => {
    // Não executar para componentes desmontados
    if (!isMountedRef.current) return;
    
    console.log(`[${new Date().toLocaleTimeString()}] Buscando dados do Campeonato Italiano... (${isManualRefresh ? 'manual' : 'automático'})`);
    
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
      
      const response = await fetch(ITALIAN_API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      // Log para depuração
      console.log('Dados recebidos da API do Campeonato Italiano:', data);
      
      // Verifica se os dados estão no formato esperado
      if (Array.isArray(data)) {
        // Definir os dados e atualizar estado
        setMatches(data);
        setLastUpdated(new Date());
        setRefreshCount(prev => prev + 1);
        console.log(`[${new Date().toLocaleTimeString()}] Dados do Campeonato Italiano atualizados - total de itens: ${data.length}`);
        
        // Não é mais a carga inicial depois da primeira atualização
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } else {
        throw new Error('Formato de dados inválido');
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
      
      console.error('Erro ao buscar dados do Campeonato Italiano:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Desativar todos os estados de carregamento
      setLoading(false);
      setIsBackgroundRefreshing(false);
    }
  }, []);
  
  /**
   * Configura o mecanismo de polling automático
   */
  const setupPolling = useCallback(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Configurando polling automático para o Campeonato Italiano a cada ${POLLING_INTERVAL/1000} segundos`);
    
    // Limpar timer anterior se existir
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // Criar novo timer de intervalo
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.log(`[${new Date().toLocaleTimeString()}] Executando polling agendado do Campeonato Italiano`);
        fetchData(false).catch(err => {
          console.error('Erro durante polling do Campeonato Italiano:', err);
        });
      }
    }, POLLING_INTERVAL);
    
    // Função de limpeza
    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] Limpando timer de polling do Campeonato Italiano`);
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [fetchData]);
  
  /**
   * Efeito principal - executa na montagem/desmontagem
   */
  useEffect(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Inicializando hook useItalianMatchData`);
    isMountedRef.current = true;
    isInitialLoadRef.current = true;
    
    // Buscar dados imediatamente ao montar
    fetchData(false).catch(err => {
      console.error('Erro na carga inicial do Campeonato Italiano:', err);
    });
    
    // Configurar polling automático
    const cleanupPolling = setupPolling();
    
    // Limpeza na desmontagem
    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] Desmontando hook useItalianMatchData`);
      isMountedRef.current = false;
      
      if (cleanupPolling) cleanupPolling();
    };
  }, [fetchData, setupPolling]);
  
  // Função pública para recarregar dados manualmente
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);
  
  return {
    matches,
    loading,
    error,
    lastUpdated,
    isBackgroundRefreshing,
    refreshCount,
    refetch
  };
}; 