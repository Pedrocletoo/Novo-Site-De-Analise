import React from 'react';
import LeagueTable from '../../components/leagues/index';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle } from './styles';

const VirtualFootball: React.FC = () => {
  return (
    <FilterProvider>
      <VirtualFootballContainer>
        <PageTitle>Futebol Virtual - Betano</PageTitle>
        <Filters />
        <LeagueTable />
      </VirtualFootballContainer>
    </FilterProvider>
  );
};

export default VirtualFootball; 