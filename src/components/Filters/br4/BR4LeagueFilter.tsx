import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { BaseFilterContextType } from '../common/types';
import { br4AvailableLeagues } from './types';

interface BR4LeagueFilterProps {
  className?: string;
  context: BaseFilterContextType;
}

/**
 * Componente para filtro de ligas específico para BR4
 */
const BR4LeagueFilter: React.FC<BR4LeagueFilterProps> = ({ className, context }) => {
  const { liga, setLiga } = context;

  // Manipulador de eventos para a mudança no filtro de liga
  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Ligas</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect 
          className="CustomSelect"
          value={liga} 
          onChange={handleLeagueChange}
        >
          {br4AvailableLeagues.map(league => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default BR4LeagueFilter; 