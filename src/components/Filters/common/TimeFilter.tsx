import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';

interface TimeFilterProps {
  className?: string;
}

/**
 * Componente para filtro de tempo (FT - full time) que pode ser usado em qualquer página
 */
const TimeFilter: React.FC<TimeFilterProps> = ({ className }) => {
  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Tempo</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect className="CustomSelect">
          <option value="FT">FT</option>
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default TimeFilter; 