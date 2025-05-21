import React from 'react';

// Exportação de componentes comuns
export * from './common';

// Exportações para o Betano
export * from './betano';

// Exportações para o BR4
export * from './br4';

// Para compatibilidade com código existente
export { 
  BetanoFilterProvider as FilterProvider, 
  useBetanoFilterContext as useFilterContext 
} from './betano/BetanoFilterContext';

/**
 * Componente de filtros padrão que usa os filtros do Betano
 * Mantido para compatibilidade com código existente
 */
const Filters: React.FC = () => {
  // Usar o BetanoFilters para manter compatibilidade
  const { BetanoFilters } = require('./betano');
  
  return <BetanoFilters />;
};

export default Filters; 