import React from 'react';
import {
  BalanceBarContainer,
  GreenBar,
  RedBar,
  PercentageLabel
} from './styles';

export interface BalanceBarProps {
  /**
   * Porcentagem verde (lado esquerdo)
   */
  greenPercentage: number;
  /**
   * Porcentagem vermelha (lado direito)
   */
  redPercentage: number;
}

/**
 * Componente de Barra de Equilíbrio
 * 
 * Exibe uma barra de equilíbrio com porcentagens verde e vermelha,
 * posicionadas nas extremidades. O componente utiliza efeitos 3D para 
 * melhorar a aparência visual.
 */
const BalanceBar: React.FC<BalanceBarProps> = ({ 
  greenPercentage, 
  redPercentage 
}) => {
  // Garantir que os valores estão arredondados para 2 casas decimais
  const formattedGreenPercentage = Number(greenPercentage).toFixed(2);
  const formattedRedPercentage = Number(redPercentage).toFixed(2);

  return (
    <div style={{ position: 'relative', marginTop: '15px' }}>
      <BalanceBarContainer>
        <GreenBar width={`${greenPercentage}%`}>
          <PercentageLabel>{formattedGreenPercentage}%</PercentageLabel>
        </GreenBar>
        <RedBar width={`${redPercentage}%`}>
          <PercentageLabel>{formattedRedPercentage}%</PercentageLabel>
        </RedBar>
      </BalanceBarContainer>
    </div>
  );
};

export default BalanceBar; 