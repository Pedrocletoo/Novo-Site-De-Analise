import React, { useState, useEffect, useContext } from 'react';
import { 
  FiltersContainer as StyledFiltersContainer, 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput
} from './styles';

// Tipo para opções de mercado
export type MarketFilterType = 'ambasMarcam' | 'handicap' | 'overUnder' | 'resultadoExato';

// Interface para filtros de mercado
export interface MarketFilterState {
  type: MarketFilterType;
  active: boolean;
  value: string;
}

// Contexto para compartilhar o estado do filtro entre componentes
export const FilterContext = React.createContext<{
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

// Hook personalizado para usar o contexto de filtro
export const useFilterContext = () => useContext(FilterContext);

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
  // Preparado para adicionar mais mercados no futuro
  /* Exemplo:
  { id: 'handicap', name: 'Handicap', options: [
    { value: '-1.5', label: '-1.5' },
    { value: '-1', label: '-1' },
    { value: '0', label: '0' },
    { value: '1', label: '+1' },
    { value: '1.5', label: '+1.5' }
  ]},
  */
];

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

const Filters: React.FC = () => {
  // Acesso ao contexto de filtro
  const { 
    hoursFilter, 
    setHoursFilter, 
    liga, 
    setLiga,
    marketFilters,
    setMarketFilter,
    activeMarketFilter
  } = useFilterContext();

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  // Manipulador de eventos para a mudança no filtro de liga principal
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  // Manipulador de eventos para ativar/desativar o filtro "Ambas Marcam"
  const handleAmbasMarcamToggle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isActive = e.target.value === 'ambasMarcam-sim';
    setMarketFilter('ambasMarcam', isActive, 'sim');
    
    // Desativar outros tipos de mercado
    Object.keys(marketFilters).forEach(key => {
      const type = key as MarketFilterType;
      if (type !== 'ambasMarcam') {
        setMarketFilter(type, false, marketFilters[type].value);
      }
    });
  };

  // Compatibilidade com a versão anterior (ambasMarcamFilter)
  const ambasMarcamActive = marketFilters.ambasMarcam.active && marketFilters.ambasMarcam.value === 'sim';

  return (
    <StyledFiltersContainer className="FiltersContainer">
      <StyledFilterItem className="FilterItem">
        <StyledFilterLabel className="FilterLabel">Ligas</StyledFilterLabel>
        <StyledSelectWrapper className="SelectWrapper">
          <StyledCustomSelect 
            className="CustomSelect"
            value="todos" 
            onChange={handleLigaChange}
          >
            <option value="todos">Todos</option>
          </StyledCustomSelect>
          <StyledDownArrow className="DownArrow" />
        </StyledSelectWrapper>
      </StyledFilterItem>

      <StyledFilterItem className="FilterItem">
        <StyledFilterLabel className="FilterLabel">Tempo</StyledFilterLabel>
        <StyledSelectWrapper className="SelectWrapper">
          <StyledCustomSelect className="CustomSelect">
            <option>FT</option>
          </StyledCustomSelect>
          <StyledDownArrow className="DownArrow" />
        </StyledSelectWrapper>
      </StyledFilterItem>

      <StyledFilterItem className="FilterItem">
        <StyledFilterLabel className="FilterLabel">Mercado</StyledFilterLabel>
        <StyledSelectWrapper className="SelectWrapper">
          <StyledCustomSelect 
            className="CustomSelect"
            value="ambas-marcam-sim" 
          >
            <option value="ambas-marcam-sim">Ambas Marcam - Sim</option>
          </StyledCustomSelect>
          <StyledDownArrow className="DownArrow" />
        </StyledSelectWrapper>
      </StyledFilterItem>

      <StyledFilterItem className="FilterItem">
        <StyledFilterLabel className="FilterLabel">Odds</StyledFilterLabel>
        <StyledSelectWrapper className="SelectWrapper">
          <StyledCustomSelect className="CustomSelect">
            <option value="todas">Todas</option>
          </StyledCustomSelect>
          <StyledDownArrow className="DownArrow" />
        </StyledSelectWrapper>
      </StyledFilterItem>

      <StyledFilterItem className="FilterItem">
        <StyledFilterLabel className="FilterLabel">Últimas horas</StyledFilterLabel>
        <StyledSelectWrapper className="SelectWrapper">
          <StyledCustomSelect 
            className="CustomSelect"
            value="12" 
          >
            <option value="12">12 horas</option>
          </StyledCustomSelect>
          <StyledDownArrow className="DownArrow" />
        </StyledSelectWrapper>
      </StyledFilterItem>
    </StyledFiltersContainer>
  );
};

export default Filters; 