import React from 'react';
import BR4Filters from '../../components/BR4Filters';
import BR4League from '../../components/BR4League';
import { BR4FilterProvider } from '../../contexts/BR4FilterContext';
import { VirtualFootballContainer, PageTitle } from './styles';

const BR4: React.FC = () => {
  return (
    <BR4FilterProvider>
      <VirtualFootballContainer>
        <PageTitle>Futebol Virtual - BR4</PageTitle>
        <BR4Filters />
        <BR4League />
      </VirtualFootballContainer>
    </BR4FilterProvider>
  );
};

export default BR4; 