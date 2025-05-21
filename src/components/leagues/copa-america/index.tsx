import React from 'react';
import CopaAmericaTable from './CopaAmericaTable';
import styled from 'styled-components';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para a Copa América
 * Usa o componente base CopaAmericaTable com configurações específicas
 */
const CopaAmerica: React.FC = () => {
  return (
    <>
      <LeagueTitle>Copa América</LeagueTitle>
      <CopaAmericaTable 
        leagueId="copa-america" 
        leagueName="Copa América"
      />
    </>
  );
};

export default CopaAmerica; 