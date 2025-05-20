import React from 'react';
import styled from 'styled-components';
import ItaliaLeagueTable from './ItaliaLeagueTable';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a liga da Italia na BR4
 */
const ItaliaLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>Italia</LeagueTitle>
      <ItaliaLeagueTable 
        leagueId="italia" 
        leagueName="Italia"
      />
    </>
  );
};

export default ItaliaLeague; 