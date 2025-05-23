import React from 'react';
import styled from 'styled-components';
import EuroLeagueTable from './EuroLeagueTable';
import { useFilterContext } from '../../Filters';

const Container = styled.section`
  margin-bottom: 30px;
  width: 100%;
`;

const LeagueHeader = styled.div`
  margin-bottom: 16px;
  
  h2 {
    font-size: 1.4rem;
    color: var(--text-color);
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    span {
      font-weight: 600;
    }
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-light);
    margin: 0;
  }
`;

/**
 * Componente que renderiza a tabela da Euro League
 */
const EuroLeague: React.FC = () => {
  const { liga } = useFilterContext();
  
  // Se não estiver mostrando a Euro League, não renderizar nada
  if (liga !== 'euro' && liga !== 'todos') {
    return null;
  }
  
  return (
    <Container>
      <LeagueHeader>
        <h2>
          <span>Euro League</span>
        </h2>
        <p>Resultados recentes e estatísticas da Euro League.</p>
      </LeagueHeader>
      
      <EuroLeagueTable 
        leagueId="euro" 
        leagueName="Euro League" 
      />
    </Container>
  );
};

export default EuroLeague;