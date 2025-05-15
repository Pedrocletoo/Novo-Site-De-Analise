import React from 'react';
import ItalianLeagueTable from './ItalianLeagueTable';
import styled from 'styled-components';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente específico para o Campeonato Italiano
 * Usa o componente de tabela personalizado com minutos diferentes
 */
const CampeonatoItaliano: React.FC = () => {
  return (
    <>
      <LeagueTitle>Campeonato Italiano</LeagueTitle>
      <ItalianLeagueTable 
        leagueId="italiano" 
        leagueName="Campeonato Italiano"
      />
    </>
  );
};

export default CampeonatoItaliano; 