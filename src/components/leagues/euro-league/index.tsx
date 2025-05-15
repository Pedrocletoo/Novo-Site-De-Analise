import React from 'react';
import EuroLeagueTable from './EuroLeagueTable';
import styled from 'styled-components';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a Euro League
 * Usa o componente base LeagueTable com configurações específicas
 */
const EuroLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>Euro League</LeagueTitle>
      <EuroLeagueTable 
        leagueId="euro" 
        leagueName="Euro League"
      />
    </>
  );
};

export default EuroLeague;