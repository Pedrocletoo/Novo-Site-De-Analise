import React from 'react';
import LeagueTable from '../../components/leagues/index';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle } from './styles';
import { TimeFilterProvider } from '../../components/Filters/common/TimeFilter';

const VirtualFootball: React.FC = () => {
  return (
    <FilterProvider>
      <TimeFilterProvider>
        <VirtualFootballContainer>
          <PageTitle>
            Futebol Virtual - Betano
          </PageTitle>
          <Filters />
          <LeagueTable />
        </VirtualFootballContainer>
      </TimeFilterProvider>
    </FilterProvider>
  );
};

export default VirtualFootball; 