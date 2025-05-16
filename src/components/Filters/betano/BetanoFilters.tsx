import React from 'react';
import { FiltersContainer as StyledFiltersContainer } from '../styles';
import { useBetanoFilterContext } from './BetanoFilterContext';

// Importar os componentes de filtro
import LeagueFilter from '../common/LeagueFilter';
import TimeFilter from '../common/TimeFilter';
import MarketFilter from '../common/MarketFilter';
import OddsFilter from '../common/OddsFilter';
import HoursFilter from '../common/HoursFilter';

/**
 * Componente de filtros específico para a página Betano
 */
const BetanoFilters: React.FC = () => {
  const context = useBetanoFilterContext();

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

export default BetanoFilters; 