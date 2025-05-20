import React from 'react';
import styled from 'styled-components';
import EspanhaLeagueTable from './EspanhaLeagueTable';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a liga da Espanha na BR4
 */
const EspanhaLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>Espanha</LeagueTitle>
      <EspanhaLeagueTable 
        leagueId="espanha" 
        leagueName="Espanha"
      />
    </>
  );
};

export default EspanhaLeague; 