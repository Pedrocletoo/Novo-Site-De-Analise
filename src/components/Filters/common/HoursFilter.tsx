import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { BaseFilterContextType } from './types';

interface HoursFilterProps {
  className?: string;
  context: BaseFilterContextType;
}

/**
 * Componente para filtro de horas que pode ser usado em qualquer página
 */
const HoursFilter: React.FC<HoursFilterProps> = ({ className, context }) => {
  const { hoursFilter, setHoursFilter } = context;

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Últimas horas</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect 
          className="CustomSelect"
          value={hoursFilter.toString()} 
          onChange={handleHoursFilterChange}
        >
          <option value="6">6 horas</option>
          <option value="12">12 horas</option>
          <option value="24">24 horas</option>
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default HoursFilter; 