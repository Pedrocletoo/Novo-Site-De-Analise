import React from 'react';
import { FiltersContainer as StyledFiltersContainer } from '../styles';
import { useBR4FilterContext } from './BR4FilterContext';

// Importar os componentes de filtro
import BR4LeagueFilter from './BR4LeagueFilter';
import TimeFilter from '../common/TimeFilter';
import BR4MarketFilter from './BR4MarketFilter';
import BR4OddsFilter from './BR4OddsFilter';
import HoursFilter from '../common/HoursFilter';

/**
 * Componente de filtros específico para a página BR4
 */
const BR4Filters: React.FC = () => {
  const context = useBR4FilterContext();

  return (
    <StyledFiltersContainer className="FiltersContainer">
      <BR4LeagueFilter context={context} />
      <TimeFilter />
      <BR4MarketFilter />
      <BR4OddsFilter />
      <HoursFilter context={context} />
    </StyledFiltersContainer>
  );
};

export default BR4Filters; 