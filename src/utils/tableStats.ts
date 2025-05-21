/**
 * Utilidades para cálculo de estatísticas de tabelas
 */
import { IMatch } from '../services/api';
import { CellColor } from '../components/TableVirtualFootball/types';

// Tipo de retorno para estatísticas de células
export interface CellStats {
  // Coluna "%" - Porcentagem de células verdes sobre o total
  greenPercentage: number;
  
  // Coluna "Greens" - Total de células verdes
  totalGreenCells: number;
  
  // Coluna "⚽️" - Total de gols na hora
  totalGoals: number;
}

// Interface para uma célula de dados para contabilização
export interface TableCell {
  isEmpty: boolean;      // Se a célula está vazia (não tem jogo)
  color: CellColor;      // Cor da célula (green, red, white)
  match?: IMatch;        // Dados da partida
}

/**
 * Calcula estatísticas para uma linha da tabela (uma hora específica)
 * 
 * @param cells - Array de células de uma hora específica
 * @returns Objeto com as estatísticas calculadas
 */
export function calculateRowStats(cells: TableCell[]): CellStats {
  // Filtrar apenas células não vazias (que têm conteúdo)
  const nonEmptyCells = cells.filter(cell => !cell.isEmpty);
  
  // Contar células por cor
  const greenCells = nonEmptyCells.filter(cell => cell.color === 'green');
  const redCells = nonEmptyCells.filter(cell => cell.color === 'red');
  
  // Calcular totais para estatísticas
  const totalGreenCells = greenCells.length;
  const totalColoredCells = greenCells.length + redCells.length; // Contar apenas células verdes e vermelhas
  
  // Calcular total de gols em cada célula (homeScore + awayScore)
  const totalGoals = nonEmptyCells.reduce((sum, cell) => {
    if (cell.match) {
      const homeScore = parseInt(cell.match.FullTimeHomeTeam) || 0;
      const awayScore = parseInt(cell.match.FullTimeAwayTeam) || 0;
      return sum + homeScore + awayScore;
    }
    return sum;
  }, 0);
  
  // Calcular porcentagem (evitar divisão por zero)
  // Consideramos apenas células verdes e vermelhas para o cálculo
  const greenPercentage = totalColoredCells > 0
    ? Math.round((totalGreenCells / totalColoredCells) * 100)
    : 0;
  
  return {
    greenPercentage,
    totalGreenCells,
    totalGoals
  };
}

/**
 * Determina se uma porcentagem deve ser exibida em verde ou vermelho
 * 
 * @param percentage - A porcentagem a ser avaliada
 * @returns True se deve ser exibida em verde, false para vermelho
 */
export function isGreenPercentage(percentage: number): boolean {
  // Uma porcentagem é considerada "verde" se for >= 50%
  return percentage >= 50;
} 