import React from 'react';
import FilterableMatchesTable from '../../components/MatchesTable/FilterableMatchesTable';
import {
  PageContainer,
  PageTitle,
  PageDescription
} from './styles';

/**
 * Página que exibe a tabela de partidas com filtros
 * Utiliza a mesma estrutura que consome dados da API real
 */
const MatchesFiltersPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Tabela de Partidas</PageTitle>
      <PageDescription>
        Use os filtros abaixo para encontrar partidas específicas por hora e minuto.
      </PageDescription>
      
      <FilterableMatchesTable />
    </PageContainer>
  );
};

export default MatchesFiltersPage; 