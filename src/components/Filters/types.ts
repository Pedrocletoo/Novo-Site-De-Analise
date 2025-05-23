// Tipo para opções de mercado
export type MarketFilterType = 'ambasMarcam' | 'handicap' | 'overUnder' | 'resultadoExato' | 'over' | 'under' | 'totalGols' | 'viradinha';

// Interface para filtros de mercado
export interface MarketFilterState {
  type: MarketFilterType;
  active: boolean;
  value: string;
}

// Interface para opções de mercado disponíveis
export interface MarketOption {
  value: string;
  label: string;
}

// Interface para mercados disponíveis
export interface AvailableMarket {
  id: MarketFilterType;
  name: string;
  options: MarketOption[];
}

// Lista de mercados disponíveis
export const availableMarkets: AvailableMarket[] = [
  { 
    id: 'ambasMarcam', 
    name: 'Ambas Marcam', 
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' }
    ]
  },
  { 
    id: 'over', 
    name: 'Over', 
    options: [
      { value: '0.5', label: '0.5' },
      { value: '1.5', label: '1.5' },
      { value: '2.5', label: '2.5' },
      { value: '3.5', label: '3.5' },
      { value: '4.5', label: '4.5' },
      { value: '5.5', label: '5.5' }
    ]
  },
  { 
    id: 'under', 
    name: 'Under', 
    options: [
      { value: '0.5', label: '0.5' },
      { value: '1.5', label: '1.5' },
      { value: '2.5', label: '2.5' },
      { value: '3.5', label: '3.5' },
      { value: '4.5', label: '4.5' }
    ]
  },
  { 
    id: 'totalGols', 
    name: 'Total de Gols', 
    options: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' }
    ]
  },
  { 
    id: 'viradinha', 
    name: 'Viradinha', 
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' }
    ]
  }
  // Preparado para adicionar mais mercados no futuro
  /* Exemplo:
  { 
    id: 'handicap', 
    name: 'Handicap', 
    options: [
      { value: '-1.5', label: '-1.5' },
      { value: '-1', label: '-1' },
      { value: '0', label: '0' },
      { value: '1', label: '+1' },
      { value: '1.5', label: '+1.5' }
    ]
  },
  */
];

// Lista de ligas disponíveis
export interface LeagueOption {
  id: string;
  name: string;
}

export const availableLeagues: LeagueOption[] = [
  { id: 'todos', name: 'Todos' },
  { id: 'euro', name: 'Euro League' },
  { id: 'italiano', name: 'Campeonato Italiano' },
  { id: 'copa-estrelas', name: 'Copa das Estrelas' },
  { id: 'copa-america', name: 'Copa América' },
  { id: 'taca-gloria-eterna', name: 'Taça Glória Eterna' }
];

// Interface do contexto de filtros
export interface FilterContextType {
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
} 