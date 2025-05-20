import React, { useCallback } from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';
import { availableMarkets, MarketFilterType } from '../common/types';
import { useBR4FilterContext } from './BR4FilterContext';

interface BR4OddsFilterProps {
  className?: string;
}

/**
 * Componente para filtro de odds específico para BR4
 * Mostra apenas os mercados que têm odds disponíveis na API da BR4
 */
const BR4OddsFilter: React.FC<BR4OddsFilterProps> = ({ className }) => {
  // Usar o contexto do filtro BR4 para acessar e atualizar os estados
  const { 
    marketFilters, 
    setMarketFilter, 
    activeMarketFilter, 
    setActiveMarketFilter 
  } = useBR4FilterContext();

  // Apenas os mercados disponíveis na API da BR4
  const availableBR4Markets = {
    'ambasMarcam': ['sim', 'nao'],
    'over': ['1.5', '2.5', '3.5'],
    'under': ['1.5', '2.5', '3.5'],
    'totalGols': ['0', '1', '2', '3', '4', '5', '6']
  };

  // Mapeamento para os grupos de filtros, apenas com mercados disponíveis
  const filterGroups: Record<string, MarketFilterType[]> = {
    'Ambas': ['ambasMarcam'],
    'Over/Under': ['over', 'under'],
    'Total': ['totalGols']
    // Removido 'Viradinha' pois não tem odds disponíveis
  };

  // Manipulador de mudança do select
  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Se for a opção padrão "selecionar", desativar todos os filtros
    if (value === 'selecionar') {
      // Desativar exibição de odds, mas manter o filtro ativo para coloração
      if (activeMarketFilter) {
        // Apenas definir o activeMarketFilter como null para não mostrar odds
        // Mas manter o mercado ativo para manter a coloração das células
        setActiveMarketFilter(null);
      }
      return;
    }
    
    // Extrair o tipo e valor do filtro do valor do select
    const [filterType, filterValue] = value.split('-') as [MarketFilterType, string];
    
    // Ativar o novo filtro para coloração, se ainda não estiver ativo
    if (!marketFilters[filterType].active) {
      setMarketFilter(filterType, true, filterValue);
    } else if (marketFilters[filterType].value !== filterValue) {
      // Se o filtro já estiver ativo mas com valor diferente, atualizar o valor
      setMarketFilter(filterType, true, filterValue);
    }
    
    // Definir como filtro ativo (para exibir a odd na tabela)
    setActiveMarketFilter(filterType);
  }, [activeMarketFilter, marketFilters, setMarketFilter, setActiveMarketFilter]);

  // Determinar o valor atual do select com base no filtro ativo
  const getCurrentSelectValue = useCallback(() => {
    if (!activeMarketFilter) return 'selecionar';
    
    const activeFilter = marketFilters[activeMarketFilter];
    return `${activeFilter.type}-${activeFilter.value}`;
  }, [activeMarketFilter, marketFilters]);

  // Gerar as opções para o dropdown, com grupos, apenas com mercados disponíveis
  const renderMarketOptions = () => {
    // Para cada grupo, renderizamos as opções correspondentes
    return Object.entries(filterGroups).map(([groupName, filterTypes]) => (
      <optgroup key={groupName} label={groupName}>
        {filterTypes.flatMap(filterType => {
          const market = availableMarkets.find(m => m.id === filterType);
          if (!market) return [];
          
          // Filtrar apenas os valores disponíveis na API da BR4
          const availableValues = availableBR4Markets[filterType] || [];
          
          // Para cada mercado, mostrar apenas as opções disponíveis
          return market.options
            .filter(option => availableValues.includes(option.value))
            .map(option => (
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
        <StyledCustomSelect 
          className="CustomSelect" 
          value={getCurrentSelectValue()}
          onChange={handleSelectChange}
        >
          <option value="selecionar">Selecionar Odds</option>
          {renderMarketOptions()}
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default BR4OddsFilter; 