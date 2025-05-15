export type CellColor = 'green' | 'red' | 'gray';

export interface CellColorProps {
  color: CellColor;
}

export interface HeaderCellProps {
  $color?: 'green' | 'red';
}

export interface GreenPercentageProps {
  $percentage?: number;
  isGreen?: boolean;
}

export interface TableDataItem {
  minute: number;
  scores: string[];
  greens: number;
  totalGames: number;
  percentage: number;
}

export interface HeaderPercentageItem {
  value: string;
  fraction: string;
} 