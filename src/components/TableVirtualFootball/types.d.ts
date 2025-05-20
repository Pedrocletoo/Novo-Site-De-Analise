/**
 * Definições de tipos para o componente TableVirtualFootball
 */

// Tipo para a propriedade de cor da célula
export type CellColor = 'green' | 'red' | 'white';

// Interface para a propriedade de cor da célula
export interface CellColorProps {
  color: CellColor;
}

// Interface para as propriedades do HeaderCell
export interface HeaderCellProps {
  $color?: 'green' | 'red';
}

// Interface para as propriedades de GreenPercentage
export interface GreenPercentageProps {
  isGreen: boolean;
}

// Declaração simplificada para evitar dependência do styled-components
declare module './styles' {
  export const TableContainer: React.FC<any>;
  export const Table: React.FC<any>;
  export const HeaderRow: React.FC<any>;
  export const HeaderCell: React.FC<HeaderCellProps>;
  export const DataRow: React.FC<any>;
  export const DataCell: React.FC<{color: CellColor}>;
  export const Score: React.FC<any>;
  export const SummaryCell: React.FC<any>;
  export const MinuteCell: React.FC<any>;
  export const HourCell: React.FC<any>;
  export const GreenPercentage: React.FC<GreenPercentageProps>;
}

// Declaração de módulo para types (redundante, mas ajuda a evitar o erro de linter)
declare module './types' {
  export { CellColorProps, HeaderCellProps, GreenPercentageProps, CellColor };
} 