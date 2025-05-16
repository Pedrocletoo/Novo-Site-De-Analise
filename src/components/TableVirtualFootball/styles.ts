import styled, { css, keyframes } from 'styled-components';
import { CellColorProps, HeaderCellProps, GreenPercentageProps } from './types';

// Keyframes para animação do indicador de atualização
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

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
  padding: 20px;
  text-align: center;
  width: 100%;
  font-size: 16px;
  color: ${props => props.isError ? 'var(--red-cell)' : 'var(--text-color)'};
  background-color: var(--secondary-background);
  border-radius: 6px;
  
  .loading-text {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
  }
  
  .error-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--red-cell);
    margin-bottom: 8px;
    display: block;
  }
  
  .loading-progress {
    width: 120px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin: 10px auto;
    overflow: hidden;
    position: relative;
  }
  
  .loading-bar {
    height: 100%;
    width: 30%;
    background-color: var(--accent-color);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 0;
    animation: loading 0.8s infinite ease-in-out;
  }
  
  small {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.7;
  }
  
  button {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      background-color: var(--accent-color-darker);
    }
  }
  
  @keyframes loading {
    0% {
      left: -30%;
    }
    100% {
      left: 100%;
    }
  }
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
  color: white;
  background-color: var(--secondary-background);
  
  ${props => {
    if (props.$color === 'green') {
      return css`
        color: var(--green-cell);
      `;
    }
    
    if (props.$color === 'red') {
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
    color: white;
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
  color: white;
`;

export const DataCell = styled.td<CellColorProps>`
  padding: 10px 8px;
  text-align: center;
  border: none;
  font-weight: 600;
  min-width: 45px;
  background-color: ${props => 
    props.color === 'green' ? 'var(--green-cell)' : 
    props.color === 'red' ? 'var(--red-cell)' : 
    'transparent'
  };
  color: ${props => 
    (props.color === 'green' || props.color === 'red') ? 'white' : 'white'
  };
  border: 1px solid rgba(9, 22, 51, 0.7);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
`;

export const Score = styled.span`
  font-size: 15px;
  font-weight: 800;
`;

export const SummaryCell = styled.td`
  padding: 10px 8px;
  text-align: center;
  border: none;
  font-weight: 500;
  background-color: var(--secondary-background);
  min-width: 45px;
  color: white;
`;

export const GreenPercentage = styled.span<GreenPercentageProps>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.isGreen ? 'var(--green-cell)' : 'var(--red-cell)'};
`;

// Indicador de conexão em tempo real
export const LiveIndicator = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #4CAF50;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #4CAF50;
    animation: ${pulseAnimation} 2s infinite ease-in-out;
  }
`;

// Ícone de atualização
export const RefreshIcon = styled.div<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

// Container para os botões
export const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

// Botão de ação
export const ActionButton = styled.button`
  background-color: var(--button-background);
  color: var(--button-text);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
  margin-left: 10px;

  &:hover {
    background-color: var(--button-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    margin-right: 6px;
  }
`; 