import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir o tipo do contexto
interface SelectedResultsContextType {
  selectedResults: string[];
  setSelectedResults: React.Dispatch<React.SetStateAction<string[]>>;
  handleResultClick: (result: string) => void;
  getResultSelectionIndex: (result: string) => number;
}

// Criar o contexto
const SelectedResultsContext = createContext<SelectedResultsContextType | undefined>(undefined);

// Props para o provedor
interface SelectedResultsProviderProps {
  children: ReactNode;
}

// Provedor do contexto
export const SelectedResultsProvider: React.FC<SelectedResultsProviderProps> = ({ children }) => {
  // Estado para rastrear até 4 resultados selecionados
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Função para selecionar/desmarcar resultados
  const handleResultClick = (result: string) => {
    // Verificar se o resultado já está selecionado
    const resultIndex = selectedResults.indexOf(result);
    
    if (resultIndex >= 0) {
      // Se o resultado já está selecionado, remove da lista
      const newResults = [...selectedResults];
      newResults.splice(resultIndex, 1);
      setSelectedResults(newResults);
    } else {
      // Se não está selecionado, adiciona à lista (limitando a 4 resultados)
      const newResults = [...selectedResults];
      if (newResults.length >= 4) {
        newResults.shift(); // Remove o primeiro resultado se já tiver 4
      }
      newResults.push(result);
      setSelectedResults(newResults);
    }
  };

  // Verificar índice do resultado selecionado
  const getResultSelectionIndex = (result: string) => {
    return selectedResults.indexOf(result);
  };

  // Valor do contexto
  const value = {
    selectedResults,
    setSelectedResults,
    handleResultClick,
    getResultSelectionIndex
  };

  return (
    <SelectedResultsContext.Provider value={value}>
      {children}
    </SelectedResultsContext.Provider>
  );
};

// Hook para acessar o contexto
export const useSelectedResults = (): SelectedResultsContextType => {
  const context = useContext(SelectedResultsContext);
  if (context === undefined) {
    throw new Error('useSelectedResults deve ser usado dentro de um SelectedResultsProvider');
  }
  return context;
}; 