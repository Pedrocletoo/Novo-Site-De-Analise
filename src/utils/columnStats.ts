import { IMatch } from '../services/api';
import { CellColor } from '../components/TableVirtualFootball/types';
import { TableCell } from './tableStats';
import { MarketFilterState, MarketFilterType } from '../components/Filters/types';
import { TimeFilterOption } from '../components/Filters/common/TimeFilter';
import { getCellColor } from '../components/leagues/shared/BaseLeagueTable';

/**
 * Interface para estatísticas de colunas (minutos)
 */
export interface ColumnStats {
  // Porcentagem de células verdes sobre o total
  greenPercentage: number;
  
  // Total de células verdes
  totalGreenCells: number;
  
  // Total de células coloridas (verdes + vermelhas)
  totalColoredCells: number;
}

/**
 * Interface para as opções de renderização
 */
interface ColumnRenderOptions {
  marketFilters?: Record<MarketFilterType, MarketFilterState>;
  timeFilter?: TimeFilterOption;
}

/**
 * Calcula estatísticas para uma coluna da tabela (um minuto específico)
 * 
 * @param columnCells - Array de células de um minuto específico
 * @returns Objeto com as estatísticas calculadas
 */
export function calculateColumnStats(columnCells: TableCell[]): ColumnStats {
  // Filtrar apenas células não vazias (que têm conteúdo)
  const nonEmptyCells = columnCells.filter(cell => !cell.isEmpty);
  
  // Contar células por cor
  const greenCells = nonEmptyCells.filter(cell => cell.color === 'green');
  const redCells = nonEmptyCells.filter(cell => cell.color === 'red');
  
  // Calcular totais para estatísticas
  const totalGreenCells = greenCells.length;
  const totalColoredCells = greenCells.length + redCells.length; // Contar apenas células verdes e vermelhas
  
  // Calcular porcentagem (evitar divisão por zero)
  const greenPercentage = totalColoredCells > 0
    ? Math.round((totalGreenCells / totalColoredCells) * 100)
    : 0;
  
  return {
    greenPercentage,
    totalGreenCells,
    totalColoredCells
  };
}

/**
 * Calcula estatísticas para todas as colunas (minutos) da tabela
 * 
 * @param cells - Objeto com todas as células da tabela
 * @param minutes - Array com todos os minutos da tabela
 * @param hours - Array com todas as horas exibidas na tabela
 * @param options - Opções de renderização (filtros de mercado, etc.)
 * @returns Array com estatísticas para cada coluna (minuto)
 */
export function calculateAllColumnsStats(
  cells: Record<string, { matches: IMatch[] }>,
  minutes: { value: string }[],
  hours: number[],
  options?: ColumnRenderOptions
): ColumnStats[] {
  // Array para armazenar estatísticas de cada coluna
  const columnsStats: ColumnStats[] = [];
  
  // Para cada minuto, calcular estatísticas
  minutes.forEach(minute => {
    const minuteValue = parseInt(minute.value);
    const columnCells: TableCell[] = [];
    
    // Para cada hora, obter a célula neste minuto
    hours.forEach(hour => {
      const cellKey = `${hour}:${minuteValue}`;
      const cellData = cells[cellKey];
      
      // Se a célula estiver vazia, adicionar célula vazia
      if (!cellData || cellData.matches.length === 0) {
        columnCells.push({
          isEmpty: true,
          color: 'white'
        });
        return;
      }
      
      // Pegar o primeiro jogo da célula
      const match = cellData.matches[0];
      
      // Determinar a cor da célula usando a mesma função que o componente da tabela
      // Isso garante consistência na renderização e nos cálculos
      const cellColor = getCellColor(
        undefined, 
        match, 
        { marketFilters: options?.marketFilters }, 
        options?.timeFilter
      );
      
      // Adicionar célula ao array
      columnCells.push({
        isEmpty: false,
        color: cellColor.color as CellColor,
        match
      });
    });
    
    // Calcular estatísticas para esta coluna
    const stats = calculateColumnStats(columnCells);
    columnsStats.push(stats);
  });
  
  return columnsStats;
} 