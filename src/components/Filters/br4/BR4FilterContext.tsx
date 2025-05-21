import React, { createContext, useContext, useState } from 'react';
import { BaseFilterProvider } from '../common/BaseFilterProvider';
import { BaseFilterContextType, defaultContextValue } from '../common/types';

// Criar um defaultValue específico para BR4 com activeMarketFilter explicitamente null
const br4DefaultContextValue: BaseFilterContextType = {
  ...defaultContextValue,
  liga: 'todos',
  activeMarketFilter: null  // Garantir que seja null
};

// Criação do contexto específico para BR4
export const BR4FilterContext = createContext<BaseFilterContextType>(br4DefaultContextValue);

// Hook personalizado para usar o contexto de filtro do BR4
export const useBR4FilterContext = () => useContext(BR4FilterContext);

// Provider específico para BR4, que utiliza o BaseFilterProvider
export const BR4FilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <BaseFilterProvider context={BR4FilterContext} initialLiga="todos">
      {children}
    </BaseFilterProvider>
  );
}; 