import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { BaseFilterContextType, availableMarkets } from './types';

interface MarketFilterProps {
  className?: string;
  context: BaseFilterContextType;
}

/**
 * Componente para filtro de mercado que pode ser usado em qualquer página
 */
const MarketFilter: React.FC<MarketFilterProps> = ({ className, context }) => {
  const { marketFilters, setMarketFilter } = context;

  // Função para manipular a mudança no filtro de mercado
  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const [marketType, marketValue] = selectedValue.split('-');
    
    // Verificar se o tipo de mercado é válido
    if (marketType && marketType in marketFilters) {
      // Ativar o filtro selecionado com o valor escolhido
      setMarketFilter(marketType as keyof typeof marketFilters, true, marketValue);
      
      // Desativar outros tipos de mercado
      Object.keys(marketFilters).forEach(key => {
        const type = key as keyof typeof marketFilters;
        if (type !== marketType) {
          setMarketFilter(type, false, marketFilters[type].value);
        }
      });
    }
  };

  // Determinar o valor atualmente selecionado
  const getSelectedValue = () => {
    const activeFilter = Object.entries(marketFilters).find(
      ([_, filter]) => filter.active
    );
    
    if (activeFilter) {
      const [type, filter] = activeFilter;
      return `${type}-${filter.value}`;
    }
    
    // Fallback para evitar estado indefinido
    return 'ambasMarcam-sim';
  };

  // Gerar as opções para o dropdown
  const renderMarketOptions = () => {
    return availableMarkets.flatMap(market => 
      market.options.map(option => (
        <option 
          key={`${market.id}-${option.value}`} 
          value={`${market.id}-${option.value}`}
        >
          {`${market.name} - ${option.label}`}
        </option>
      ))
    );
  };

  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Mercado</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect 
          className="CustomSelect"
          value={getSelectedValue()}
          onChange={handleMarketChange}
        >
          {renderMarketOptions()}
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default MarketFilter; 