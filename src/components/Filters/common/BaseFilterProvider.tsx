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
  initialLiga?: string;
}

/**
 * Provedor base para filtros que pode ser usado tanto para Betano quanto para BR4
 * com compartilhamento de lógica, mas contextos separados
 */
export const BaseFilterProvider: React.FC<BaseFilterProviderProps> = ({ 
  children, 
  context,
  initialLiga = 'todos'
}) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>(initialLiga);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([
    'euro', 'italiano', 'copa-estrelas', 'copa-america', 'taca-gloria-eterna'
  ]);
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
  
  // Estado para o filtro de mercado ativo
  const [activeMarketFilter, setActiveMarketFilter] = useState<MarketFilterType | null>(null);
  
  // Função para atualizar um filtro de mercado específico
  const setMarketFilter = (type: MarketFilterType, active: boolean, value: string) => {
    setMarketFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], active, value }
    }));
    
    // Apenas desativamos o filtro aqui quando necessário
    // A ativação será feita explicitamente pelo dropdown de Odds
    if (!active && type === activeMarketFilter) {
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