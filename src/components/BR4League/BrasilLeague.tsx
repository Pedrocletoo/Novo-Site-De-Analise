import React from 'react';
import styled from 'styled-components';
import BrasilLeagueTable from './BrasilLeagueTable';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a liga do Brasil na BR4
 */
const BrasilLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>Brasil</LeagueTitle>
      <BrasilLeagueTable 
        leagueId="brasil" 
        leagueName="Brasil"
      />
    </>
  );
};

export default BrasilLeague; 