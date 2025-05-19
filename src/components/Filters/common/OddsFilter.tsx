import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { availableMarkets, MarketFilterType } from './types';

interface OddsFilterProps {
  className?: string;
}

/**
 * Componente para filtro de odds que pode ser usado em qualquer página
 */
const OddsFilter: React.FC<OddsFilterProps> = ({ className }) => {
  // Mapeamento para os grupos de filtros
  const filterGroups: Record<string, MarketFilterType[]> = {
    'Ambas': ['ambasMarcam'],
    'Over/Under': ['over', 'under'],
    'Total': ['totalGols'],
    'Viradinha': ['viradinha'],
  };

  // Gerar as opções para o dropdown, com grupos
  const renderMarketOptions = () => {
    // Para cada grupo, renderizamos as opções correspondentes
    return Object.entries(filterGroups).map(([groupName, filterTypes]) => (
      <optgroup key={groupName} label={groupName}>
        {filterTypes.flatMap(filterType => {
          const market = availableMarkets.find(m => m.id === filterType);
          if (!market) return [];
          
          // Caso especial para 'viradinha': mostrar apenas o nome do mercado, sem o sufixo
          if (market.id === 'viradinha') {
            return (
              <option 
                key={`${market.id}-${market.options[0].value}`} 
                value={`${market.id}-${market.options[0].value}`}
              >
                {market.name}
              </option>
            );
          }
          
          // Para outros mercados, mostrar com o sufixo normal
          return market.options.map(option => (
            <option 
              key={`${market.id}-${option.value}`} 
              value={`${market.id}-${option.value}`}
            >
              {`${market.name} - ${option.label}`}
            </option>
          ));
        })}
      </optgroup>
    ));
  };

  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Odds</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect className="CustomSelect" value="selecionar">
          <option value="selecionar">Selecionar Odds</option>
          {renderMarketOptions()}
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default OddsFilter; 