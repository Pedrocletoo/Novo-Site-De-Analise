import React from 'react';
import styled from 'styled-components';
import { ColumnStats } from '../../utils/columnStats';
import { GreenPercentage } from './styles';
import { isGreenPercentage } from '../../utils/tableStats';

// Componente estilizado para a linha de porcentagens
const PercentageRow = styled.tr`
  background-color: var(--secondary-background);
  border-bottom: none;
`;

// Componente estilizado para a célula de porcentagem
const PercentageCell = styled.td`
  text-align: center;
  padding: 5px 8px;
  background-color: var(--secondary-background);
  min-width: 45px;
`;

// Componente estilizado para o container das porcentagens
const PercentageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// Componente estilizado para o valor da porcentagem
const PercentageValue = styled(GreenPercentage)`
  font-size: 15px;
  font-weight: 600;
`;

// Componente estilizado para o número de células verdes
const GreenCount = styled.span<{ isGreen: boolean }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.isGreen ? 'var(--green-cell)' : 'var(--red-cell)'};
  opacity: 0.9;
`;

interface MinuteHeaderPercentageProps {
  columnsStats: ColumnStats[];
}

/**
 * Componente que exibe as porcentagens de células verdes para cada minuto
 */
const MinuteHeaderPercentage: React.FC<MinuteHeaderPercentageProps> = ({ columnsStats }) => {
  return (
    <PercentageRow>
      <PercentageCell></PercentageCell> {/* Célula vazia para alinhar com a primeira coluna (Hora/Minuto) */}
      {columnsStats.map((stats, index) => (
        <PercentageCell key={`percentage-${index}`}>
          <PercentageContainer>
            <PercentageValue isGreen={isGreenPercentage(stats.greenPercentage)}>
              {stats.greenPercentage}%
            </PercentageValue>
            <GreenCount isGreen={isGreenPercentage(stats.greenPercentage)}>
              ({stats.totalGreenCells})
            </GreenCount>
          </PercentageContainer>
        </PercentageCell>
      ))}
      <PercentageCell colSpan={3}></PercentageCell> {/* Células vazias para alinhar com as colunas finais (%, Greens, ⚽️) */}
    </PercentageRow>
  );
};

export default MinuteHeaderPercentage; 