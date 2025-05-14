import React, { useState, useMemo } from 'react';
import { useMatchData } from '../../hooks';
import { IMatch } from '../../services/api';
import MatchesTable from './index';
import {
  FilterContainer,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  FilterInput,
  FilterButton,
  FiltersWrapper
} from './filterStyles';

interface FilterProps {
  hourFilter: string;
  minuteFilter: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
  onClearFilters: () => void;
}

/**
 * Componente de filtros para as partidas
 */
const MatchesFilters: React.FC<FilterProps> = ({
  hourFilter,
  minuteFilter,
  onHourChange,
  onMinuteChange,
  onClearFilters
}) => {
  // Gerar opções de horas (0-23)
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return <option key={hour} value={hour}>{hour}</option>;
    });
  }, []);

  // Gerar opções de minutos (0-59)
  const minuteOptions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const minute = i.toString().padStart(2, '0');
      return <option key={minute} value={minute}>{minute}</option>;
    });
  }, []);

  return (
    <FilterContainer>
      <FiltersWrapper>
        <FilterGroup>
          <FilterLabel>Filtrar por Hora</FilterLabel>
          <FilterSelect 
            value={hourFilter} 
            onChange={(e) => onHourChange(e.target.value)}
          >
            <option value="">Todas</option>
            {hourOptions}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Filtrar por Minuto</FilterLabel>
          <FilterSelect 
            value={minuteFilter} 
            onChange={(e) => onMinuteChange(e.target.value)}
          >
            <option value="">Todos</option>
            {minuteOptions}
          </FilterSelect>
        </FilterGroup>

        <FilterButton onClick={onClearFilters}>
          Limpar Filtros
        </FilterButton>
      </FiltersWrapper>
    </FilterContainer>
  );
};

/**
 * Componente principal que combina filtros e tabela de partidas
 * Consome o mesmo hook useMatchData para acessar os dados da API
 */
const FilterableMatchesTable: React.FC = () => {
  // Estados para os filtros
  const [hourFilter, setHourFilter] = useState<string>('');
  const [minuteFilter, setMinuteFilter] = useState<string>('');

  // Usando o mesmo hook que a página /partidas utiliza
  const { matches, loading, error } = useMatchData();

  // Aplicar filtros aos jogos
  const filteredMatches = useMemo(() => {
    if (!matches || loading || error) return [];

    return matches.filter(match => {
      try {
        const matchDate = new Date(match.StartTime);
        const matchHour = matchDate.getHours();
        const matchMinute = matchDate.getMinutes();

        // Aplicar filtro por hora se existir
        if (hourFilter && matchHour !== parseInt(hourFilter)) {
          return false;
        }

        // Aplicar filtro por minuto se existir
        if (minuteFilter && matchMinute !== parseInt(minuteFilter)) {
          return false;
        }

        return true;
      } catch (err) {
        // Em caso de erro no processamento da data, mantém o jogo nos resultados
        console.error('Erro ao filtrar partida:', err);
        return true;
      }
    });
  }, [matches, hourFilter, minuteFilter, loading, error]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setHourFilter('');
    setMinuteFilter('');
  };

  return (
    <>
      <MatchesFilters
        hourFilter={hourFilter}
        minuteFilter={minuteFilter}
        onHourChange={setHourFilter}
        onMinuteChange={setMinuteFilter}
        onClearFilters={clearFilters}
      />
      
      {/* Passa os dados filtrados para o componente da tabela */}
      <MatchesTable matches={filteredMatches} />
    </>
  );
};

export default FilterableMatchesTable; 