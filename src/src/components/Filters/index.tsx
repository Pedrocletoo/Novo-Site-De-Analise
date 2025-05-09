import React, { useState, useEffect, useContext } from 'react';
import { 
  FiltersContainer, 
  FilterItem, 
  FilterLabel, 
  SelectWrapper, 
  CustomSelect,
  DownArrow
} from './styles';

// Contexto para compartilhar o estado do filtro entre componentes
export const FilterContext = React.createContext<{
  hoursFilter: number;
  setHoursFilter: React.Dispatch<React.SetStateAction<number>>;
}>({
  hoursFilter: 12,
  setHoursFilter: () => {}
});

// Hook personalizado para usar o contexto de filtro
export const useFilterContext = () => useContext(FilterContext);

// Provider que envolve os componentes que precisam acessar os filtros
export const FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);

  return (
    <FilterContext.Provider value={{ hoursFilter, setHoursFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

const Filters: React.FC = () => {
  // Acesso ao contexto de filtro
  const { hoursFilter, setHoursFilter } = useFilterContext();

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  return (
    <FiltersContainer>
      <FilterItem>
        <FilterLabel>Liga</FilterLabel>
        <SelectWrapper>
          <CustomSelect>
            <option>Todos</option>
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
            <option value="36">36 horas</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>
    </FiltersContainer>
  );
};

export default Filters; 