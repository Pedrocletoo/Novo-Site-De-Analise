import React from 'react';
import LeagueTable from '../../components/leagues/index';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle, ConnectionStatus } from './styles';
import { useWebSocket } from '../../contexts/WebSocketContext';

const VirtualFootball: React.FC = () => {
  const { connectionState } = useWebSocket();

  return (
    <FilterProvider>
      <VirtualFootballContainer>
        <PageTitle>
          Futebol Virtual - Betano
          <ConnectionStatus status={connectionState} />
        </PageTitle>
        <Filters />
        <LeagueTable />
      </VirtualFootballContainer>
    </FilterProvider>
  );
};

export default VirtualFootball; 