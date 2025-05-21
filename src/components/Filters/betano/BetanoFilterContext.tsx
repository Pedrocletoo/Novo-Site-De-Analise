import React, { createContext, useContext } from 'react';
import { BaseFilterProvider } from '../common/BaseFilterProvider';
import { BaseFilterContextType, defaultContextValue } from '../common/types';

// Criação do contexto específico para Betano
export const BetanoFilterContext = createContext<BaseFilterContextType>(defaultContextValue);

// Hook personalizado para usar o contexto de filtro do Betano
export const useBetanoFilterContext = () => useContext(BetanoFilterContext);

// Provider específico para Betano, que utiliza o BaseFilterProvider
export const BetanoFilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <BaseFilterProvider context={BetanoFilterContext}>
      {children}
    </BaseFilterProvider>
  );
}; 