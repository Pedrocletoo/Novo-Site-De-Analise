import React from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { useBR4FilterContext } from './BR4FilterContext';
import { availableMarkets, MarketFilterType } from '../common/types';

interface BR4MarketFilterProps {
  className?: string;
}

/**
 * Componente para filtro de mercado específico para BR4
 */
const BR4MarketFilter: React.FC<BR4MarketFilterProps> = ({ className }) => {
  const { marketFilters, setMarketFilter, setActiveMarketFilter } = useBR4FilterContext();

  // Função para manipular a mudança no filtro de mercado
  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const [marketType, marketValue] = selectedValue.split('-') as [MarketFilterType, string];
    
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
      
      // Sempre resetar o activeMarketFilter para null quando mudar pelo dropdown de "Mercado"
      // Isso fará o dropdown de "Odds" voltar para "Selecionar Odds"
      setActiveMarketFilter(null);
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

  // Mapeamento para os grupos de filtros
  const filterGroups: Record<string, MarketFilterType[]> = {
    'Ambas': ['ambasMarcam'],
    'Over/Under': ['over', 'under'],
    'Total': ['totalGols'],
    'Viradinha': ['viradinha'],
  };

  // Gerar as opções para o dropdown, agora com grupos
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

export default BR4MarketFilter; 