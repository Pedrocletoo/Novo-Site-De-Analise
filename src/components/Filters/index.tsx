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
  liga: string;
  setLiga: React.Dispatch<React.SetStateAction<string>>;
}>({
  hoursFilter: 12,
  setHoursFilter: () => {},
  liga: 'euro',
  setLiga: () => {}
});

// Hook personalizado para usar o contexto de filtro
export const useFilterContext = () => useContext(FilterContext);

// Provider que envolve os componentes que precisam acessar os filtros
export const FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hoursFilter, setHoursFilter] = useState<number>(12);
  const [liga, setLiga] = useState<string>('euro');

  return (
    <FilterContext.Provider value={{ hoursFilter, setHoursFilter, liga, setLiga }}>
      {children}
    </FilterContext.Provider>
  );
};

const Filters: React.FC = () => {
  // Acesso ao contexto de filtro
  const { hoursFilter, setHoursFilter, liga, setLiga } = useFilterContext();

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  // Manipulador de eventos para a mudança no filtro de liga
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  return (
    <FiltersContainer>
      <FilterItem>
        <FilterLabel>Liga</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={liga} onChange={handleLigaChange}>
            <option value="euro">Euro</option>
            <option value="premier">Premier</option>
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