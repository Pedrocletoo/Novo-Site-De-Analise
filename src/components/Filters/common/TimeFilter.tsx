import React, { createContext, useContext, useState } from 'react';
import { 
  FilterItem as StyledFilterItem, 
  FilterLabel as StyledFilterLabel, 
  SelectWrapper as StyledSelectWrapper, 
  CustomSelect as StyledCustomSelect,
  DownArrow as StyledDownArrow
} from '../styles';

// Tipo para o filtro de tempo
export type TimeFilterOption = 'FT' | 'HT' | 'HT+FT';

// Contexto para o filtro de tempo
interface TimeFilterContextType {
  timeFilter: TimeFilterOption;
  setTimeFilter: (value: TimeFilterOption) => void;
}

const TimeFilterContext = createContext<TimeFilterContextType>({
  timeFilter: 'FT',
  setTimeFilter: () => {}
});

// Hook personalizado para usar o filtro de tempo
export const useTimeFilter = () => useContext(TimeFilterContext);

// Provider para o filtro de tempo
export const TimeFilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('FT');
  
  return (
    <TimeFilterContext.Provider value={{ timeFilter, setTimeFilter }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

interface TimeFilterProps {
  className?: string;
}

/**
 * Componente para filtro de tempo (FT, HT, HT+FT) que pode ser usado em qualquer página
 */
const TimeFilter: React.FC<TimeFilterProps> = ({ className }) => {
  const { timeFilter, setTimeFilter } = useTimeFilter();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value as TimeFilterOption);
  };
  
  return (
    <StyledFilterItem className={className || "FilterItem"}>
      <StyledFilterLabel className="FilterLabel">Tempo</StyledFilterLabel>
      <StyledSelectWrapper className="SelectWrapper">
        <StyledCustomSelect 
          className="CustomSelect"
          value={timeFilter}
          onChange={handleChange}
        >
          <option value="FT">FT</option>
          <option value="HT">HT</option>
          <option value="HT+FT">HT + FT</option>
        </StyledCustomSelect>
        <StyledDownArrow className="DownArrow" />
      </StyledSelectWrapper>
    </StyledFilterItem>
  );
};

export default TimeFilter; 