import React from 'react';
import styled from 'styled-components';
import ItaliaLeague from './ItaliaLeague';
import InglaterraLeague from './InglaterraLeague';
import EspanhaLeague from './EspanhaLeague';
import BrasilLeague from './BrasilLeague';
import AmericaLatinaLeague from './AmericaLatinaLeague';

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
  return (
    <>
      {/* Liga Itália */}
      <ItaliaLeague />
      
      <LeagueDivider />
      
      {/* Liga Inglaterra */}
      <InglaterraLeague />
      
      <LeagueDivider />
      
      {/* Liga Espanha */}
      <EspanhaLeague />
      
      <LeagueDivider />
      
      {/* Liga Brasil */}
      <BrasilLeague />
      
      <LeagueDivider />
      
      {/* Liga América Latina */}
      <AmericaLatinaLeague />
    </>
  );
};

export default BR4League; 