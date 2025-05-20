import React from 'react';
import styled from 'styled-components';
import ItaliaLeague from './ItaliaLeague';
import InglaterraLeague from './InglaterraLeague';
import EspanhaLeague from './EspanhaLeague';
import BrasilLeague from './BrasilLeague';
import AmericaLatinaLeague from './AmericaLatinaLeague';
import { useBR4FilterContext } from '../../components/Filters/br4/BR4FilterContext';

const LeagueDivider = styled.div`
  margin: 30px 0;
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.3;
`;

/**
 * Componente principal que contém as ligas da BR4
 */
const BR4League: React.FC = () => {
  // Obter o valor selecionado do filtro de ligas
  const { liga } = useBR4FilterContext();

  // Renderizar as ligas com base no filtro selecionado
  const renderLeagues = () => {
    switch (liga) {
      case 'italia':
        return <ItaliaLeague />;
      case 'inglaterra':
        return <InglaterraLeague />;
      case 'espanha':
        return <EspanhaLeague />;
      case 'brasil':
        return <BrasilLeague />;
      case 'america-latina':
        return <AmericaLatinaLeague />;
      default:
        // Se for "todos" ou qualquer outro valor, mostrar todas as ligas
        return (
          <>
            <ItaliaLeague />
            <LeagueDivider />
            <InglaterraLeague />
            <LeagueDivider />
            <EspanhaLeague />
            <LeagueDivider />
            <BrasilLeague />
            <LeagueDivider />
            <AmericaLatinaLeague />
          </>
        );
    }
  };

  return (
    <>
      {renderLeagues()}
    </>
  );
};

export default BR4League; 