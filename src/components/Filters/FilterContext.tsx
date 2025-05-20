import React, { createContext, useContext, useState } from 'react';
import { 
  FilterContextType, 
  MarketFilterType, 
  MarketFilterState
} from './types';

// Valor padrão do contexto
const defaultContextValue: FilterContextType = {
  hoursFilter: 12,
  setHoursFilter: () => {},
  liga: 'todos',
  setLiga: () => {},
  selectedLeagues: ['euro'],
  setSelectedLeagues: () => {},
  showAllLeagues: false,
  setShowAllLeagues: () => {},
  marketFilters: {
    ambasMarcam: { type: 'ambasMarcam', active: true, value: 'sim' },
    handicap: { type: 'handicap', active: false, value: '0' },
    overUnder: { type: 'overUnder', active: false, value: '2.5' },
    resultadoExato: { type: 'resultadoExato', active: false, value: '1-0' },
    over: { type: 'over', active: false, value: '2.5' },
    under: { type: 'under', active: false, value: '2.5' },
    totalGols: { type: 'totalGols', active: false, value: '2' },
    viradinha: { type: 'viradinha', active: false, value: 'sim' }
  },
  setMarketFilter: () => {},
  activeMarketFilter: 'ambasMarcam',
  setActiveMarketFilter: () => {}
};

// Criação do contexto
export const FilterContext = createContext<FilterContextType>(defaultContextValue);

// Hook personalizado para usar o contexto de filtro
export const useFilterContext = () => useContext(FilterContext);

// Provider que envolve os componentes que precisam acessar os filtros
export const FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>('todos');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['euro', 'italiano', 'copa-estrelas', 'copa-america', 'taca-gloria-eterna']);
  const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);
  
  // Estado para os filtros de mercado
  const [marketFilters, setMarketFilters] = useState<Record<MarketFilterType, MarketFilterState>>({
    ambasMarcam: { type: 'ambasMarcam', active: true, value: 'sim' },
    handicap: { type: 'handicap', active: false, value: '0' },
    overUnder: { type: 'overUnder', active: false, value: '2.5' },
    resultadoExato: { type: 'resultadoExato', active: false, value: '1-0' },
    over: { type: 'over', active: false, value: '2.5' },
    under: { type: 'under', active: false, value: '2.5' },
    totalGols: { type: 'totalGols', active: false, value: '2' },
    viradinha: { type: 'viradinha', active: false, value: 'sim' }
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

  return (
    <FilterContext.Provider value={{ 
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
    </FilterContext.Provider>
  );
}; 