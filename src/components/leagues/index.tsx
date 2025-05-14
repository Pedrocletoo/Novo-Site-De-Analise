import React from 'react';
import { useFilterContext, availableLeagues } from '../Filters';
import styled from 'styled-components';

// Componentes específicos de cada liga
import EuroLeague from './euro-league';
import CampeonatoItaliano from './campeonato-italiano';
import CopaEstrelas from './copa-estrelas';

const LeaguesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 40px;
`;

const LeagueDivider = styled.div`
  margin: 30px 0;
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.3;
`;

/**
 * Componente que exibe as tabelas das ligas
 */
const LeagueTable: React.FC = () => {
  const { liga } = useFilterContext();

  // Renderiza o componente específico para a liga selecionada
  const renderLeagueComponents = () => {
    if (liga === 'todos') {
      // Se a opção "Todos" estiver selecionada, mostra todas as ligas
      return (
        <>
          <EuroLeague />
          <LeagueDivider />
          <CampeonatoItaliano />
          <LeagueDivider />
          <CopaEstrelas />
        </>
      );
    } else {
      // Caso contrário, mostra apenas a liga selecionada
      switch (liga) {
        case 'euro':
          return <EuroLeague />;
        case 'italiano':
          return <CampeonatoItaliano />;
        case 'copa-estrelas':
          return <CopaEstrelas />;
        default:
          return <EuroLeague />;
      }
    }
  };

  return (
    <LeaguesContainer>
      {renderLeagueComponents()}
    </LeaguesContainer>
  );
};

export default LeagueTable; 