import React from 'react';
import LeagueTable from '../../components/leagues/index';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle, ConnectionStatus } from './styles';
import { useWebSocket } from '../../contexts/WebSocketContext';

const VirtualFootball: React.FC = () => {
  const { connectionState, lastActivity } = useWebSocket();

  return (
    <FilterProvider>
      <VirtualFootballContainer>
        <PageTitle>
          Futebol Virtual - Betano
          <ConnectionStatus status={connectionState} />
        </PageTitle>
        {lastActivity && (
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            textAlign: 'right', 
            marginTop: '-20px', 
            marginBottom: '20px' 
          }}>
            Última atualização: {lastActivity.toLocaleTimeString()}
          </div>
        )}
        <Filters />
        <LeagueTable />
      </VirtualFootballContainer>
    </FilterProvider>
  );
};

export default VirtualFootball; 