import React, { useState, useContext, createContext, ReactNode } from 'react';

// Tipo para opções de mercado
export type MarketFilterType = 'ambasMarcam' | 'handicap' | 'overUnder' | 'resultadoExato';

// Interface para filtros de mercado
export interface MarketFilterState {
  type: MarketFilterType;
  active: boolean;
  value: string;
}

// Contexto para compartilhar o estado do filtro entre componentes
export const BR4FilterContext = createContext<{
  hoursFilter: number;
  setHoursFilter: React.Dispatch<React.SetStateAction<number>>;
  liga: string;
  setLiga: React.Dispatch<React.SetStateAction<string>>;
  selectedLeagues: string[];
  setSelectedLeagues: React.Dispatch<React.SetStateAction<string[]>>;
  showAllLeagues: boolean;
  setShowAllLeagues: React.Dispatch<React.SetStateAction<boolean>>;
  marketFilters: Record<MarketFilterType, MarketFilterState>;
  setMarketFilter: (type: MarketFilterType, active: boolean, value: string) => void;
  activeMarketFilter: MarketFilterType | null;
  setActiveMarketFilter: React.Dispatch<React.SetStateAction<MarketFilterType | null>>;
}>({
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
    resultadoExato: { type: 'resultadoExato', active: false, value: '1-0' }
  },
  setMarketFilter: () => {},
  activeMarketFilter: 'ambasMarcam',
  setActiveMarketFilter: () => {}
});

// Hook personalizado para usar o contexto de filtro BR4
export const useBR4FilterContext = () => useContext(BR4FilterContext);

// Lista de ligas disponíveis
export const availableLeagues = [
  { id: 'todos', name: 'Todos' },
  { id: 'euro', name: 'Euro League' },
  { id: 'italiano', name: 'Campeonato Italiano' },
  { id: 'copa-estrelas', name: 'Copa das Estrelas' },
  { id: 'copa-america', name: 'Copa América' },
  { id: 'taca-gloria-eterna', name: 'Taça Glória Eterna' }
];

// Lista de mercados disponíveis
export const availableMarkets = [
  { id: 'ambasMarcam', name: 'Ambas Marcam', options: [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ]},
];

// Provider que envolve os componentes que precisam acessar os filtros da BR4
export const BR4FilterProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>('todos');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['euro', 'italiano', 'copa-estrelas', 'copa-america', 'taca-gloria-eterna']);
  const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);
  
  // Estado para os filtros de mercado
  const [marketFilters, setMarketFilters] = useState<Record<MarketFilterType, MarketFilterState>>({
    ambasMarcam: { type: 'ambasMarcam', active: true, value: 'sim' },
    handicap: { type: 'handicap', active: false, value: '0' },
    overUnder: { type: 'overUnder', active: false, value: '2.5' },
    resultadoExato: { type: 'resultadoExato', active: false, value: '1-0' }
  });
  
  // Estado para o filtro de mercado ativo
  const [activeMarketFilter, setActiveMarketFilter] = useState<MarketFilterType | null>('ambasMarcam');
  
  // Função para atualizar um filtro de mercado específico
  const setMarketFilter = (type: MarketFilterType, active: boolean, value: string) => {
    setMarketFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], active, value }
    }));
    
    if (active) {
      setActiveMarketFilter(type);
    } 
    else if (type === activeMarketFilter) {
      setActiveMarketFilter(null);
    }
  };

  return (
    <BR4FilterContext.Provider value={{ 
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
    </BR4FilterContext.Provider>
  );
}; 