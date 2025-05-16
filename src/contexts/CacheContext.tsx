import React, { createContext, useContext, useEffect } from 'react';
import { cachedApiService } from '../services/cachedApiService';
import { workerService } from '../services/workerService';

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

/**
 * Provider para o contexto de cache centralizado
 * Inicializa o serviço de cache e workers automaticamente
 */
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Inicializar o cache centralizado e workers ao montar, sem bloquear
  useEffect(() => {
    console.log('Inicializando contexto de cache...');
    
    // Inicializar API cache apenas, sem esperar pelo pré-carregamento
    // Isso permite que a aplicação carregue instantaneamente
    cachedApiService.initialize();
    setIsInitialized(true);
    
    // Fazer a inicialização em segundo plano
    setTimeout(() => {
      // Iniciar workers para as ligas principais
      const leagues = ['euro', 'campeonato-italiano', 'taca-gloria-eterna'];
      leagues.forEach(league => {
        workerService.startWorker(league);
      });
      
      console.log('Inicialização em segundo plano concluída');
    }, 500); // Pequeno atraso para evitar impacto no carregamento inicial
    
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