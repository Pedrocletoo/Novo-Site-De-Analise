import styled, { css } from 'styled-components';
import { CellColor, HeaderCellProps, GreenPercentageProps } from './types';

export const TableContainer = styled.div`
  overflow-x: auto;
  margin: 0 auto;
  padding: 0;
  background-color: var(--secondary-background);
  border-radius: 6px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  /* Permitir rolagem horizontal se necessário */
  overflow-x: auto;
  
  /* Estilo da barra de rolagem para navegadores que suportam */
  &::-webkit-scrollbar {
    height: 8px;
    background-color: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--accent-color-rgb), 0.3);
    border-radius: 4px;
  }
  
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--accent-color-rgb), 0.3) transparent;
`;

export const LoadingMessage = styled.div<{ isError?: boolean }>`
  padding: 30px;
  text-align: center;
  width: 100%;
  font-size: 16px;
  color: ${props => props.isError ? 'var(--red-cell)' : 'var(--text-color)'};
  background-color: ${props => props.isError ? 'rgba(255, 0, 0, 0.05)' : 'var(--secondary-background)'};
  border-radius: 6px;
`;

export const Table = styled.table`
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 15px;
  margin: 0;
  white-space: nowrap;
  min-width: 100%;
  width: 100%;
  border: none;
  background-color: var(--secondary-background);
  border-radius: 0;
  overflow: hidden;
`;

export const HeaderRow = styled.tr`
  background-color: var(--secondary-background);
  border-bottom: none;
`;

export const HeaderCell = styled.th<HeaderCellProps>`
  padding: 10px 8px;
  text-align: center;
  font-weight: 600;
  border: none;
  position: relative;
  min-width: 45px;
  color: var(--text-color);
  background-color: var(--secondary-background);
  
  ${({ $color }: { $color?: 'green' | 'red' }) => {
    if ($color === 'green') {
      return css`
        color: var(--green-cell);
      `;
    }
    
    if ($color === 'red') {
      return css`
        color: var(--red-cell);
      `;
    }
    
    return '';
  }}
  
  small {
    display: block;
    font-size: 12px;
    font-weight: normal;
    margin-top: 3px;
    color: var(--text-light);
  }
  
  &:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    background-color: var(--secondary-background);
  }
`;

export const HourCell = styled(HeaderCell)`
  font-weight: 500;
  position: relative;
  z-index: 1;
  background-color: var(--secondary-background);
`;

export const DataRow = styled.tr`
  border-bottom: none;
  background-color: var(--secondary-background);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(var(--accent-color-rgb), 0.05);
  }

  &:nth-child(even) {
    background-color: rgba(var(--border-color-rgb), 0.05);
    
    &:hover {
      background-color: rgba(var(--accent-color-rgb), 0.05);
    }
  }
`;

export const MinuteCell = styled.td`
  padding: 10px 8px;
  text-align: center;
  font-weight: 600;
  border: none;
  background-color: var(--secondary-background);
  position: sticky;
  left: 0;
  z-index: 1;
  color: var(--text-color);
`;

export const DataCell = styled.td<{ color: CellColor }>`
  padding: 10px 8px;
  text-align: center;
  border: none;
  font-weight: 500;
  min-width: 45px;
  
  ${({ color }: { color: CellColor }) => {
    if (color === 'green') {
      return css`
        background-color: transparent;
        color: var(--green-cell);
      `;
    }
    
    if (color === 'red') {
      return css`
        background-color: transparent;
        color: var(--red-cell);
      `;
    }
    
    return css`
      background-color: transparent;
      color: var(--text-light);
    `;
  }}
`;

export const Score = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

export const SummaryCell = styled.td`
  padding: 10px 8px;
  text-align: center;
  border: none;
  font-weight: 500;
  background-color: var(--secondary-background);
  min-width: 45px;
  color: var(--text-color);
`;

export const GreenPercentage = styled.span<GreenPercentageProps>`
  font-size: 15px;
  font-weight: 600;
  ${({ $percentage, isGreen }: { $percentage?: number; isGreen?: boolean }) => {
    if (isGreen !== undefined) {
      return isGreen 
        ? css`color: var(--green-cell);`
        : css`color: var(--red-cell);`;
    }
    
    if ($percentage && $percentage >= 50) {
      return css`
        color: var(--green-cell);
      `;
    }
    
    if ($percentage && $percentage <= 33) {
      return css`
        color: var(--red-cell);
      `;
    }
    
    return '';
  }}
`; 