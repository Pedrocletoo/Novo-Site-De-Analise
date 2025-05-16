import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';

interface OddsFilterProps {
  className?: string;
}

/**
 * Componente para filtro de odds que pode ser usado em qualquer página
 */
const OddsFilter: React.FC<OddsFilterProps> = ({ className }) => {
  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Odds</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect className="CustomSelect">
          <option value="todas">Todas</option>
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default OddsFilter; 