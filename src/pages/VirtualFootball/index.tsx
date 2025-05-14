import React from 'react';
import TableVirtualFootball from '../../components/TableVirtualFootball';
import Filters, { FilterProvider } from '../../components/Filters';
import { VirtualFootballContainer, PageTitle } from './styles';

const VirtualFootball: React.FC = () => {
  return (
    <FilterProvider>
      <VirtualFootballContainer>
        <PageTitle>Futebol Virtual</PageTitle>
        <Filters />
        <TableVirtualFootball />
      </VirtualFootballContainer>
    </FilterProvider>
  );
};

export default VirtualFootball; 