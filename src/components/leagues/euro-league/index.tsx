import React from 'react';
import LeagueTable from '../shared/LeagueTable';
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
      <LeagueTitle>Euro League - Betano</LeagueTitle>
      <LeagueTable 
        leagueId="euro" 
        leagueName="Euro League"
      />
    </>
  );
};

export default EuroLeague; 