import { useSelectedResults } from '../contexts/SelectedResultsContext';

export interface ResultStyleProps {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  cursor: string;
  isSelected: boolean;
}

/**
 * Hook para gerenciar seleção de resultados e fornecer estilos consistentes
 * 
 * Este hook encapsula a lógica de seleção de resultados e fornece funções e
 * estilos para manter a consistência visual entre os diferentes componentes de tabela.
 */
export const useResultSelection = () => {
  const { handleResultClick, getResultSelectionIndex } = useSelectedResults();

  // Função para obter o índice do resultado
  const getResultIndex = (result: string): number => {
    return getResultSelectionIndex(result);
  };

  // Função para gerar um objeto de estilo com base no índice de seleção
  const getResultStyle = (selectionIndex: number): ResultStyleProps => {
    const isSelected = selectionIndex >= 0;
    let backgroundColor;
    let textColor;
    let fontWeight;
    
    switch (selectionIndex) {
      case 0: // Primeiro resultado - amarelo sem borda
        backgroundColor = '#FFEB3B';
        textColor = 'black';
        fontWeight = 'bold';
        break;
      case 1: // Segundo resultado - branco
        backgroundColor = 'white';
        textColor = 'black';
        fontWeight = 'bold';
        break;
      case 2: // Terceiro resultado - preto
        backgroundColor = 'black';
        textColor = 'white';
        fontWeight = 'bold';
        break;
      case 3: // Quarto resultado - roxo
        backgroundColor = 'purple';
        textColor = 'white';
        fontWeight = 'bold';
        break;
      default:
        backgroundColor = undefined;
        textColor = undefined;
        fontWeight = undefined;
    }
    
    return {
      backgroundColor,
      textColor,
      fontWeight,
      cursor: 'pointer',
      isSelected
    };
  };

  // Função para selecionar um resultado
  const selectResult = (result: string): void => {
    handleResultClick(result);
  };

  // Função para formatar resultado a partir dos scores
  const formatResult = (homeScore: number, awayScore: number): string => {
    return `${homeScore}-${awayScore}`;
  };

  // Função para obter estilo diretamente a partir dos scores
  const getStyleFromScores = (homeScore: number, awayScore: number): ResultStyleProps => {
    const result = formatResult(homeScore, awayScore);
    const selectionIndex = getResultIndex(result);
    return getResultStyle(selectionIndex);
  };

  return {
    selectResult,
    getResultIndex,
    getResultStyle,
    formatResult,
    getStyleFromScores
  };
}; 