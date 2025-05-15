import React from 'react';
import { 
  useBR4FilterContext,
  MarketFilterType  
} from '../../contexts/BR4FilterContext';
import { 
  FiltersContainer,
  FilterItem,
  FilterLabel,
  SelectWrapper,
  CustomSelect,
  DownArrow
} from '../Filters/styles';

const BR4Filters: React.FC = () => {
  // Acesso ao contexto de filtro BR4
  const { 
    hoursFilter, 
    setHoursFilter, 
    liga, 
    setLiga,
    marketFilters,
    setMarketFilter,
    activeMarketFilter
  } = useBR4FilterContext();

  // Manipulador de eventos para a mudança no filtro de horas
  const handleHoursFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoursFilter(parseInt(e.target.value, 10));
  };

  // Manipulador de eventos para a mudança no filtro de liga principal
  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  // Manipulador de eventos para ativar/desativar o filtro "Ambas Marcam"
  const handleAmbasMarcamToggle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isActive = e.target.value === 'ambasMarcam-sim';
    setMarketFilter('ambasMarcam', isActive, 'sim');
    
    // Desativar outros tipos de mercado
    Object.keys(marketFilters).forEach(key => {
      const type = key as MarketFilterType;
      if (type !== 'ambasMarcam') {
        setMarketFilter(type, false, marketFilters[type].value);
      }
    });
  };

  // Compatibilidade com a versão anterior (ambasMarcamFilter)
  const ambasMarcamActive = marketFilters.ambasMarcam.active && marketFilters.ambasMarcam.value === 'sim';

  return (
    <FiltersContainer className="FiltersContainer">
      <FilterItem className="FilterItem">
        <FilterLabel className="FilterLabel">Ligas</FilterLabel>
        <SelectWrapper className="SelectWrapper">
          <CustomSelect 
            className="CustomSelect"
            value="todos" 
            onChange={handleLigaChange}
          >
            <option value="todos">Todos</option>
          </CustomSelect>
          <DownArrow className="DownArrow" />
        </SelectWrapper>
      </FilterItem>

      <FilterItem className="FilterItem">
        <FilterLabel className="FilterLabel">Tempo</FilterLabel>
        <SelectWrapper className="SelectWrapper">
          <CustomSelect className="CustomSelect">
            <option>FT</option>
          </CustomSelect>
          <DownArrow className="DownArrow" />
        </SelectWrapper>
      </FilterItem>

      <FilterItem className="FilterItem">
        <FilterLabel className="FilterLabel">Mercado</FilterLabel>
        <SelectWrapper className="SelectWrapper">
          <CustomSelect 
            className="CustomSelect"
            value="ambas-marcam-sim" 
          >
            <option value="ambas-marcam-sim">Ambas Marcam - Sim</option>
          </CustomSelect>
          <DownArrow className="DownArrow" />
        </SelectWrapper>
      </FilterItem>

      <FilterItem className="FilterItem">
        <FilterLabel className="FilterLabel">Odds</FilterLabel>
        <SelectWrapper className="SelectWrapper">
          <CustomSelect className="CustomSelect">
            <option value="todas">Todas</option>
          </CustomSelect>
          <DownArrow className="DownArrow" />
        </SelectWrapper>
      </FilterItem>

      <FilterItem className="FilterItem">
        <FilterLabel className="FilterLabel">Últimas horas</FilterLabel>
        <SelectWrapper className="SelectWrapper">
          <CustomSelect 
            className="CustomSelect"
            value={hoursFilter.toString()} 
            onChange={handleHoursFilterChange}
          >
            <option value="6">6 horas</option>
            <option value="12">12 horas</option>
            <option value="24">24 horas</option>
          </CustomSelect>
          <DownArrow className="DownArrow" />
        </SelectWrapper>
      </FilterItem>
    </FiltersContainer>
  );
};

export default BR4Filters; 