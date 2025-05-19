import React from 'react';
import styled from 'styled-components';
import InglaterraLeagueTable from './InglaterraLeagueTable';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a liga da Inglaterra na BR4
 */
const InglaterraLeague: React.FC = () => {
  return (
    <>
      <LeagueTitle>Inglaterra</LeagueTitle>
      <InglaterraLeagueTable 
        leagueId="inglaterra" 
        leagueName="Inglaterra"
      />
    </>
  );
};

export default InglaterraLeague; 