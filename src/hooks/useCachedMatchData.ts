import { useState, useEffect, useCallback, useRef } from 'react';
import { IMatch } from '../services/api';
import { cachedApiService, CachedApiUpdateListener } from '../services/cachedApiService';
import { cacheService } from '../services/cacheService';
import { workerService } from '../services/workerService';

/**
 * Hook personalizado para buscar dados utilizando o cache centralizado
 * Versão super-otimizada para carregamento instantâneo de dados
 * 
 * @param liga - Nome da liga (euro, campeonato-italiano, etc.)
 * @param result - Parâmetro adicional para a consulta (padrão: '480')
 * @returns Objeto com dados e estado de carregamento
 */
export const useCachedMatchData = (liga: string, result: string = '480') => {
  // Estados
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('cache');
  
  // Referências para controle interno
  const isMountedRef = useRef<boolean>(true);
  const isInitialFetchRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateInProgressRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const staleTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Manipulador de atualizações do cache
   */
  const handleCacheUpdate: CachedApiUpdateListener = useCallback((data, source) => {
    if (!isMountedRef.current) return;
    
    // Não atualizar se não temos dados ou se já temos mais dados que a atualização
    if (!data || data.length === 0) return;
    
    // Se já temos dados e a nova atualização tem menos dados, ignorar
    // a menos que venha diretamente da API para evitar regressão de dados
    if (matches.length > 0 && data.length < matches.length && source !== 'api') {
      console.log(`⚠️ Ignorando atualização com menos dados (${data.length} vs ${matches.length})`);
      return;
    }
    
    setMatches(data);
    setDataSource(source);
    setLastUpdated(cachedApiService.getLastUpdated(liga) || new Date());
    
    // Sempre desligar o carregamento quando recebemos dados
    setLoading(false);
    
    if (source === 'api') {
      // Se os dados vieram diretamente da API, mostrar estado de atualização brevemente
      setIsBackgroundRefreshing(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsBackgroundRefreshing(false);
        }
      }, 300);
    }
  }, [liga, matches.length]);
  
  /**
   * Busca dados com estratégia otimizada para UX
   * - Nunca bloqueia UI por mais de 800ms
   * - Mostra dados parciais imediatamente
   * - Atualiza em background
   * - Persistente após recargas da página
   */
  const fetchDataOptimized = useCallback(async () => {
    if (!isMountedRef.current || updateInProgressRef.current) return;
    
    updateInProgressRef.current = true;
    
    try {
      // Apenas no primeiro carregamento, mostrar estado de carregamento
      if (isInitialFetchRef.current) {
        setLoading(true);
      } else {
        setIsBackgroundRefreshing(true);
      }
      
      // Verificar localStorage primeiro - garantir persistência entre recargas
      const cacheKey = `matches_${liga}_480`;
      
      // Sempre tentar obter dados do cache com prioridade absoluta
      const cachedData = cacheService.get<IMatch[]>(cacheKey, true); // Ignorar expiração
      
      // PRIORIDADE MÁXIMA: Se temos QUALQUER dado em cache, mostrar imediatamente
      if (cachedData && cachedData.length > 0) {
        console.log(`✅ Dados de cache disponíveis para ${liga}: ${cachedData.length} itens`);
        setMatches(cachedData);
        setDataSource('cache');
        setLastUpdated(cachedApiService.getLastUpdated(liga) || new Date());
        setLoading(false);
        isInitialFetchRef.current = false;
        
        // Verificar idade do cache
        const timeLeft = cacheService.getTimeToLive(cacheKey);
        console.log(`⏱️ Cache expira em ${Math.round(timeLeft/1000)}s para ${liga}`);
        
        // Prioridade nas tabelas problemáticas (Campeonato Italiano e Taça Glória Eterna)
        const isPriorityLeague = liga === 'campeonato-italiano' || liga === 'taca-gloria-eterna';
        
        // Se o cache estiver perto de expirar, atualizar em background
        // Menos agressivo para ligas prioritárias (evitar perda de dados)
        const updateThreshold = isPriorityLeague ? 600000 : 20000; // 10 min para prioritárias, 20s para outras (ajustado para novos TTLs)
        
        if (timeLeft < updateThreshold) {
          console.log(`🔄 Atualizando em background para ${liga}...`);
          setIsBackgroundRefreshing(true);
          
          // Limitar a frequência de atualizações
          if (staleTimeoutIdRef.current) {
            clearTimeout(staleTimeoutIdRef.current);
          }
          
          // Backoff maior para ligas prioritárias
          const backoffTime = isPriorityLeague ? 500 : 100; // Reduzido para atualizações ainda mais rápidas
          
          staleTimeoutIdRef.current = setTimeout(() => {
            cachedApiService.getMatches(liga, result)
              .then(newData => {
                // Importante: só atualizar se a nova resposta tiver dados
                if (newData && newData.length > 0) {
                  handleCacheUpdate(newData, 'api');
                } else {
                  console.log(`⚠️ Background update ignorado para ${liga}: API retornou dados vazios`);
                }
              })
              .catch((err) => {
                console.warn(`Falha na atualização em background para ${liga}:`, err);
              })
              .finally(() => {
                if (isMountedRef.current) {
                  setIsBackgroundRefreshing(false);
                }
              });
          }, backoffTime);
        }
        
        // Evitar solicitações desnecessárias à API para ligas prioritárias
        if ((isPriorityLeague && timeLeft > 900000) || // 15 min para prioritárias (mantido)
            (!isPriorityLeague && timeLeft > 120000)) { // 2 min para outras (reduzido de 3 min para 2 min)
          updateInProgressRef.current = false;
          return;
        }
      }
      
      // Se chegamos aqui, significa que não temos dados em cache ou eles expiraram completamente
      // Definir um timeout para evitar bloqueio da UI
      const timeoutPromise = new Promise<IMatch[]>((_, reject) => {
        fetchTimeoutRef.current = setTimeout(() => {
          reject(new Error('Tempo limite excedido'));
        }, 800); // Mostrar algo em no máximo 800ms
      });
      
      // Tentar buscar dados do cache/API em paralelo
      try {
        const data = await Promise.race([
          cachedApiService.getMatches(liga, result),
          timeoutPromise
        ]);
        
        // Limpar timeout
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = null;
        }
        
        if (!isMountedRef.current) return;
        
        if (data && data.length > 0) {
          // Importante: só atualizar se não piorar os dados que já temos
          if (matches.length === 0 || data.length >= matches.length) {
            console.log(`✅ Dados novos obtidos para ${liga}: ${data.length} itens`);
            setMatches(data);
            setLastUpdated(cachedApiService.getLastUpdated(liga) || new Date());
            setLoading(false);
            setIsBackgroundRefreshing(false);
            isInitialFetchRef.current = false;
            retryCountRef.current = 0;
          } else {
            console.log(`⚠️ Ignorando atualização que reduziria dados de ${matches.length} para ${data.length}`);
          }
        }
      } catch (err) {
        // Timeout ou erro - continuar com os dados que temos
        console.log(`⏱️ Timeout ou erro ao buscar dados para ${liga}, usando dados parciais`);
        
        // Se ainda não temos dados, fazer retry automaticamente
        if (matches.length === 0 && retryCountRef.current < 3) {
          retryCountRef.current++;
          console.log(`🔄 Tentativa ${retryCountRef.current}/3 para ${liga}`);
          
          // Pequeno atraso antes do retry (backoff exponencial)
          const backoffTime = Math.min(500 * Math.pow(2, retryCountRef.current - 1), 2000);
          setTimeout(() => {
            if (isMountedRef.current) {
              updateInProgressRef.current = false;
              fetchDataOptimized();
            }
          }, backoffTime);
        } else {
          // Última tentativa: tentar worker diretamente
          if (matches.length === 0) {
            console.log(`⚡ Última tentativa: worker direto para ${liga}`);
            workerService.fetchDataForLeague(liga, true)
              .then(() => {
                if (!isMountedRef.current) return;
                
                const lastChanceData = cacheService.get<IMatch[]>(cacheKey, true);
                if (lastChanceData && lastChanceData.length > 0) {
                  setMatches(lastChanceData);
                  setDataSource('cache');
                  setLastUpdated(new Date());
                  setLoading(false);
                  isInitialFetchRef.current = false;
                }
              })
              .catch(() => {
                if (isMountedRef.current) {
                  setLoading(false);
                }
              });
          } else {
            // Temos alguns dados, então esconder loading
            setLoading(false);
          }
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error(`❌ Erro ao buscar dados para ${liga}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      setIsBackgroundRefreshing(false);
    } finally {
      if (isMountedRef.current) {
        // Sempre desligar loading após alguns segundos, mesmo que tenhamos falhado
        if (loading) {
          setTimeout(() => {
            if (isMountedRef.current && loading) {
              setLoading(false);
            }
          }, 3000);
        }
        
        // Permitir nova atualização
        setTimeout(() => {
          updateInProgressRef.current = false;
        }, 500);
      }
    }
  }, [liga, result, handleCacheUpdate, loading, matches.length]);
  
  /**
   * Força atualização manual dos dados
   */
  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await cachedApiService.forceUpdate(liga);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Erro ao forçar atualização para ${liga}:`, error);
    }
  }, [liga]);
  
  /**
   * Efeito para inicialização e registro de listeners
   */
  useEffect(() => {
    isMountedRef.current = true;
    isInitialFetchRef.current = true;
    retryCountRef.current = 0;
    
    console.log(`🔧 [${liga}] Inicializando hook useCachedMatchData`);
    
    // Registrar listener para atualizações de cache
    cachedApiService.addUpdateListener(liga, handleCacheUpdate);
    
    // Buscar dados com estratégia otimizada
    fetchDataOptimized();
    
    // Prioridade nas tabelas problemáticas
    const isPriorityLeague = liga === 'campeonato-italiano' || liga === 'taca-gloria-eterna';
    
    // Intervalo de refresh baseado no tipo de liga
    const refreshInterval = isPriorityLeague ? 1500 : 2000; // 1.5s para ligas prioritárias, 2s para as demais
    
    console.log(`⏰ [${liga}] Configurando refresh automático a cada ${refreshInterval}ms`);
    
    // Adicionar um intervalo periódico para verificar dados novos
    // independentemente do estado do cache
    const periodicRefreshTimer = setInterval(() => {
      if (isMountedRef.current) {
        const now = new Date().toLocaleTimeString();
        console.log(`⏱️ [${now}] Refresh periódico para ${liga}...`);
        
        // Verificar se não estamos em meio a um update
        if (!updateInProgressRef.current) {
          console.log(`🔄 [${liga}] Iniciando refresh de dados...`);
          cachedApiService.getMatches(liga, result)
            .then(newData => {
              if (newData && newData.length > 0) {
                // Só atualizar se a nova resposta tiver dados
                console.log(`✅ [${liga}] Dados atualizados: ${newData.length} itens`);
                handleCacheUpdate(newData, 'api');
              } else {
                console.log(`⚠️ [${liga}] Nenhum dado recebido no refresh periódico`);
              }
            })
            .catch(err => {
              console.warn(`❌ [${liga}] Erro no refresh periódico:`, err);
            });
        } else {
          console.log(`⏸️ [${liga}] Refresh periódico ignorado - update em progresso`);
        }
      }
    }, refreshInterval); // Intervalo diferenciado por tipo de liga
    
    console.log(`✅ [${liga}] Refresh automático configurado e ativo`);
    
    // Limpeza na desmontagem
    return () => {
      console.log(`🧹 [${liga}] Limpando recursos do hook useCachedMatchData`);
      isMountedRef.current = false;
      cachedApiService.removeUpdateListener(liga, handleCacheUpdate);
      
      // Limpar timers
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      if (staleTimeoutIdRef.current) {
        clearTimeout(staleTimeoutIdRef.current);
      }
      
      clearInterval(periodicRefreshTimer);
      console.log(`🛑 [${liga}] Refresh automático interrompido`);
    };
  }, [liga, result, handleCacheUpdate, fetchDataOptimized]);
  
  /**
   * Indicador se os dados estão ao vivo
   * Considera dados ao vivo se a última atualização foi nos últimos 20 segundos
   */
  const isLive = Boolean(lastUpdated && (Date.now() - lastUpdated.getTime()) < 20000);
  
  return {
    matches,
    loading,
    error,
    lastUpdated,
    isBackgroundRefreshing,
    dataSource,
    isLive,
    refetch
  };
}; 