import React from 'react';
import styled from 'styled-components';
import AmericaLatinaLeagueTable from './AmericaLatinaLeagueTable';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a liga América Latina na BR4
 */
const AmericaLatinaLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>América Latina</LeagueTitle>
      <AmericaLatinaLeagueTable 
        leagueId="americalatina" 
        leagueName="América Latina"
      />
    </>
  );
};

export default AmericaLatinaLeague; 