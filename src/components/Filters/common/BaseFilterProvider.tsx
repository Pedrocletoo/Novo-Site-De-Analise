import React, { useState, ReactNode } from 'react';
import { 
  BaseFilterContextType, 
  MarketFilterType, 
  MarketFilterState,
  defaultContextValue
} from './types';

interface BaseFilterProviderProps {
  children: ReactNode;
  context: React.Context<BaseFilterContextType>;
}

/**
 * Provedor base para filtros que pode ser usado tanto para Betano quanto para BR4
 * com compartilhamento de lógica, mas contextos separados
 */
export const BaseFilterProvider: React.FC<BaseFilterProviderProps> = ({ 
  children, 
  context 
}) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>('todos');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([
    'euro', 'italiano', 'copa-estrelas', 'copa-america', 'taca-gloria-eterna'
  ]);
  const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);
  
  // Estado para os filtros de mercado
  const [marketFilters, setMarketFilters] = useState<Record<MarketFilterType, MarketFilterState>>({
    ambasMarcam: { type: 'ambasMarcam', active: true, value: 'sim' },
    handicap: { type: 'handicap', active: false, value: '0' },
    overUnder: { type: 'overUnder', active: false, value: '2.5' },
    resultadoExato: { type: 'resultadoExato', active: false, value: '1-0' }
  });
  
  // Estado para o filtro de mercado ativo (sempre será 'ambasMarcam')
  const [activeMarketFilter, setActiveMarketFilter] = useState<MarketFilterType | null>('ambasMarcam');
  
  // Função para atualizar um filtro de mercado específico
  const setMarketFilter = (type: MarketFilterType, active: boolean, value: string) => {
    setMarketFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], active, value }
    }));
    
    // Se estiver ativando um filtro, defina-o como o filtro ativo
    if (active) {
      setActiveMarketFilter(type);
    } 
    // Se estiver desativando o filtro ativo, limpe o filtro ativo
    else if (type === activeMarketFilter) {
      setActiveMarketFilter(null);
    }
  };

  // Usamos o Context.Provider que foi passado como prop
  const Provider = context.Provider;

  return (
    <Provider value={{ 
      hoursFilter, 
      setHoursFilter, 
      liga, 
      setLiga, 
      selectedLeagues, 
      setSelectedLeagues,
      showAllLeagues,
      setShowAllLeagues,
      marketFilters,
      setMarketFilter,
      activeMarketFilter,
      setActiveMarketFilter
    }}>
      {children}
    </Provider>
  );
}; 