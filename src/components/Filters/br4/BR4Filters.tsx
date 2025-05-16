import React from 'react';
import { FiltersContainer as StyledFiltersContainer } from '../styles';
import { useBR4FilterContext } from './BR4FilterContext';

// Importar os componentes de filtro
import LeagueFilter from '../common/LeagueFilter';
import TimeFilter from '../common/TimeFilter';
import MarketFilter from '../common/MarketFilter';
import OddsFilter from '../common/OddsFilter';
import HoursFilter from '../common/HoursFilter';

/**
 * Componente de filtros específico para a página BR4
 */
const BR4Filters: React.FC = () => {
  const context = useBR4FilterContext();

  return (
    <StyledFiltersContainer className="FiltersContainer">
      <LeagueFilter context={context} />
      <TimeFilter />
      <MarketFilter context={context} />
      <OddsFilter />
      <HoursFilter context={context} />
    </StyledFiltersContainer>
  );
};

export default BR4Filters; 