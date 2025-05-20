import React from 'react';
import CopaEstrelasLeagueTable from './CopaEstrelasLeagueTable';
import styled from 'styled-components';

const LeagueTitle = styled.h2`
  font-size: 20px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  text-align: left;
  font-weight: 600;
`;

/**
 * Componente principal da Copa das Estrelas
 * Liga exclusiva da Sportscaps
 */
const CopaEstrelas: React.FC = () => {
  return (
    <>
      <LeagueTitle>Copa das Estrelas</LeagueTitle>
      <CopaEstrelasLeagueTable 
        leagueId="copa-estrelas" 
        leagueName="Copa das Estrelas"
      />
    </>
  );
};

export default CopaEstrelas; 