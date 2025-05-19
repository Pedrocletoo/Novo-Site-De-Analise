import React from 'react';
import LeagueTable from '../../components/leagues/index';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle, ConnectionStatus } from './styles';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { TimeFilterProvider } from '../../components/Filters/common/TimeFilter';

const VirtualFootball: React.FC = () => {
  const { connectionState } = useWebSocket();

  return (
    <FilterProvider>
      <TimeFilterProvider>
        <VirtualFootballContainer>
          <PageTitle>
            Futebol Virtual - Betano
            <ConnectionStatus status={connectionState} />
          </PageTitle>
          <Filters />
          <LeagueTable />
        </VirtualFootballContainer>
      </TimeFilterProvider>
    </FilterProvider>
  );
};

export default VirtualFootball; 