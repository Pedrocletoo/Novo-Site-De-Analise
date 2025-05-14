import React, { useState, useEffect, useContext } from 'react';
import { 
  FiltersContainer, 
  FilterItem, 
  FilterLabel, 
  SelectWrapper, 
  CustomSelect,
  DownArrow,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput
} from './styles';

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
}>({
  hoursFilter: 12,
  setHoursFilter: () => {},
  liga: 'todos',
  setLiga: () => {},
  selectedLeagues: ['euro'],
  setSelectedLeagues: () => {},
  showAllLeagues: false,
  setShowAllLeagues: () => {}
});

// Hook personalizado para usar o contexto de filtro
export const useFilterContext = () => useContext(FilterContext);

// Lista de ligas disponíveis
export const availableLeagues = [
  { id: 'todos', name: 'Todos' },
  { id: 'euro', name: 'Euro League' }
];

// Provider que envolve os componentes que precisam acessar os filtros
export const FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>('todos');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['euro']);
  const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);

  return (
    <FilterContext.Provider value={{ 
      hoursFilter, 
      setHoursFilter, 
      liga, 
      setLiga, 
      selectedLeagues, 
      setSelectedLeagues,
      showAllLeagues,
      setShowAllLeagues
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
    setLiga
  } = useFilterContext();

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  // Manipulador de eventos para a mudança no filtro de liga principal
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  return (
    <FiltersContainer>
      <FilterItem>
        <FilterLabel>Ligas</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={liga} onChange={handleLigaChange}>
            {availableLeagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Tempo</FilterLabel>
        <SelectWrapper>
          <CustomSelect>
            <option>FT</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Mercado</FilterLabel>
        <SelectWrapper>
          <CustomSelect>
            <option>Ambas marcam - Sim</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Odds</FilterLabel>
        <SelectWrapper>
          <CustomSelect>
            <option>Selecionar odds</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Últimas horas</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={hoursFilter} onChange={handleHoursFilterChange}>
            <option value="6">6 horas</option>
            <option value="12">12 horas</option>
            <option value="24">24 horas</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>
    </FiltersContainer>
  );
};

export default Filters; 