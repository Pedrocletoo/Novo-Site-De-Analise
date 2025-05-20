export type CellColor = 'red' | 'green' | 'blue' | 'yellow' | 'white';

export interface CellColorProps {
  color: CellColor;
}

export interface HeaderCellProps {
  isActive?: boolean;
  $color?: 'green' | 'red';
}

export interface GreenPercentageProps {
  isGreen: boolean;
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