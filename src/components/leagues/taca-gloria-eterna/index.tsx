import React from 'react';
import TacaGloriaEternaTable from './TacaGloriaEternaTable';
import styled from 'styled-components';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente principal da Taça Glória Eterna
 * Usa o componente TacaGloriaEternaTable para exibição dos dados
 */
const TacaGloriaEterna: React.FC = () => {
  return (
    <>
      <LeagueTitle>Taça Glória Eterna</LeagueTitle>
      <TacaGloriaEternaTable 
        leagueId="taca-gloria-eterna" 
        leagueName="Taça Glória Eterna"
      />
    </>
  );
};

export default TacaGloriaEterna; 