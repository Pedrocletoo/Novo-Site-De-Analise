import React from 'react';
import { BR4Filters } from '../../components/Filters/br4';
import BR4League from '../../components/BR4League';
import { BR4FilterProvider } from '../../components/Filters/br4/BR4FilterContext';
import { VirtualFootballContainer, PageTitle } from './styles';
import { TimeFilterProvider } from '../../components/Filters/common/TimeFilter';

const BR4: React.FC = () => {
  return (
    <BR4FilterProvider>
      <TimeFilterProvider>
        <VirtualFootballContainer>
          <PageTitle>Futebol Virtual - BR4</PageTitle>
          <BR4Filters />
          <BR4League />
        </VirtualFootballContainer>
      </TimeFilterProvider>
    </BR4FilterProvider>
  );
};

export default BR4; 