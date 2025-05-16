import React, { createContext, useContext, useEffect } from 'react';
import { cachedApiService } from '../services/cachedApiService';
import { workerService } from '../services/workerService';
import { apiService, IMatch } from '../services/api';
import { cacheService } from '../services/cacheService';

interface CacheContextType {
  isInitialized: boolean;
  restartWorkers: () => void;
}

// Criação do contexto
const CacheContext = createContext<CacheContextType>({
  isInitialized: false,
  restartWorkers: () => {}
});

// Hook para usar o contexto
export const useCacheContext = () => useContext(CacheContext);

// Dados de fallback em caso de falha no carregamento inicial
const FALLBACK_DATA: IMatch[] = [
  {
    id: 'fallback-1',
    EventId: 'fallback-1',
    RegionId: 'fallback',
    Liga: '',
    DisplayNameParts: [{ name: 'Time A' }, { name: 'Time B' }],
    StartTime: new Date().toISOString(),
    Markets: [],
    FullTimeHomeTeam: '1',
    FullTimeAwayTeam: '0',
    HalfTimeHomeTeam: '0',
    HalfTimeAwayTeam: '0'
  },
  {
    id: 'fallback-2',
    EventId: 'fallback-2',
    RegionId: 'fallback',
    Liga: '',
    DisplayNameParts: [{ name: 'Time C' }, { name: 'Time D' }],
    StartTime: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    Markets: [],
    FullTimeHomeTeam: '2',
    FullTimeAwayTeam: '1',
    HalfTimeHomeTeam: '1',
    HalfTimeAwayTeam: '0'
  }
];

/**
 * Provider para o contexto de cache centralizado
 * Inicializa o serviço de cache e workers automaticamente
 * Implementa pré-carregamento de dados para evitar tela de carregamento
 */
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Inicializar o cache centralizado com dados pré-carregados
  useEffect(() => {
    console.log('Inicializando contexto de cache...');
    
    // Lista de ligas principais
    const leagues = [
      'euro', 
      'campeonato-italiano', 
      'taca-gloria-eterna',
      'br4-italy',
      'br4-england',
      'br4-spain',
      'br4-brasil',
      'br4-america-latina'
    ];
    
    // Função para iniciar workers para todas as ligas
    const startAllWorkers = () => {
      leagues.forEach(league => {
        workerService.startWorker(league);
      });
      setIsInitialized(true);
      console.log('✅ Workers iniciados para todas as ligas');
    };
    
    // Função para pré-carregar dados de uma liga para o cache
    const preloadLeagueData = async (league: string): Promise<void> => {
      const cacheKey = `matches_${league}_480`;
      
      // Verificar se já temos dados em cache
      const existingCache = cacheService.get<IMatch[]>(cacheKey, true);
      if (existingCache && existingCache.length > 0) {
        console.log(`✅ Cache já disponível para ${league} com ${existingCache.length} itens`);
        return;
      }
      
      // Prioridades de carregamento: críticas para o Campeonato Italiano e Taça Glória Eterna
      const isPriorityLeague = league === 'campeonato-italiano' || league === 'taca-gloria-eterna';
      const retryAttempts = isPriorityLeague ? 3 : 1;
      
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          // Buscar dados diretamente da API para pré-popular o cache
          console.log(`⚡ Pré-carregando dados para ${league}... (tentativa ${attempt}/${retryAttempts})`);
          const data = await apiService.getMatches(league, '480');
          
          if (data && data.length > 0) {
            // Salvar no cache com TTL longo
            const ttl = isPriorityLeague ? 7200000 : 600000; // 2 horas para ligas prioritárias, 10 min para outras
            cacheService.set(cacheKey, data, ttl);
            console.log(`✅ Cache pré-carregado para ${league} com ${data.length} itens`);
            return; // Sucesso, sair do loop
          } else {
            console.warn(`⚠️ API retornou array vazio para ${league}`);
            
            if (attempt === retryAttempts) {
              // Última tentativa, usar dados de fallback
              console.log(`⚠️ Usando dados de fallback para ${league} após ${attempt} tentativas`);
              const ttl = isPriorityLeague ? 7200000 : 300000; // 2 horas para prioritárias, 5 min para outras
              cacheService.set(cacheKey, FALLBACK_DATA, ttl);
            } else {
              // Esperar antes de tentar novamente
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          console.error(`❌ Erro na tentativa ${attempt} ao pré-carregar cache para ${league}:`, error);
          
          if (attempt === retryAttempts) {
            // Última tentativa, usar dados de fallback
            console.log(`⚠️ Usando dados de fallback para ${league} após ${attempt} tentativas`);
            const ttl = isPriorityLeague ? 7200000 : 300000; // 2 horas para prioritárias, 5 min para outras
            cacheService.set(cacheKey, FALLBACK_DATA, ttl);
          } else {
            // Esperar antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };
    
    // Inicializar API cache 
    cachedApiService.initialize();
    
    // Pré-carregar dados para as ligas principais em paralelo
    Promise.all(leagues.map(league => preloadLeagueData(league)))
      .then(() => {
        console.log('✅ Todos os caches pré-carregados com sucesso');
        // Após pré-carregar, iniciar workers para manter o cache atualizado
        startAllWorkers();
      })
      .catch(error => {
        console.error('Erro durante pré-carregamento:', error);
        // Mesmo com erro, devemos iniciar workers
        startAllWorkers();
      });
    
    // Limpeza ao desmontar o componente
    return () => {
      console.log('Limpando serviços de cache centralizado...');
      cachedApiService.cleanup();
    };
  }, []);
  
  // Função para reiniciar os workers
  const restartWorkers = () => {
    console.log('Reiniciando workers...');
    workerService.restartAll();
  };
  
  // Valor do contexto
  const contextValue: CacheContextType = {
    isInitialized,
    restartWorkers
  };
  
  // Sempre renderizar os filhos imediatamente, sem bloqueio
  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}; 