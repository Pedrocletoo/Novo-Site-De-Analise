import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from './styles';
import { useFilterContext } from './FilterContext';
import { availableMarkets } from './types';

interface MarketFilterProps {
  className?: string;
}

const MarketFilter: React.FC<MarketFilterProps> = ({ className }) => {
  const { marketFilters, setMarketFilter } = useFilterContext();

  // Função para manipular a mudança no filtro de mercado
  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const [marketType, marketValue] = selectedValue.split('-');
    
    if (marketType === 'ambasMarcam') {
      // Ativar o filtro "Ambas Marcam" com o valor selecionado
      setMarketFilter('ambasMarcam', true, marketValue);
      
      // Desativar outros tipos de mercado (preparando para o futuro)
      Object.keys(marketFilters).forEach(key => {
        const type = key as keyof typeof marketFilters;
        if (type !== 'ambasMarcam') {
          setMarketFilter(type, false, marketFilters[type].value);
        }
      });
    }
    // Aqui podemos adicionar mais tipos de mercado no futuro
  };

  // Determinar o valor atualmente selecionado
  const getSelectedValue = () => {
    if (marketFilters.ambasMarcam.active) {
      return `ambasMarcam-${marketFilters.ambasMarcam.value}`;
    }
    // Aqui podemos adicionar outros casos para outros tipos de mercado
    
    // Fallback para evitar estado indefinido
    return 'ambasMarcam-sim';
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
          {/* Opções para "Ambas Marcam" */}
          <option value="ambasMarcam-sim">Ambas Marcam - Sim</option>
          <option value="ambasMarcam-nao">Ambas Marcam - Não</option>
          
          {/* Aqui podemos adicionar mais opções de mercado no futuro */}
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default MarketFilter; 