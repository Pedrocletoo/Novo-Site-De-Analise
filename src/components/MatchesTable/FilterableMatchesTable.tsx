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
  ligaFilter: string;
  timeFormat: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
  onLigaChange: (liga: string) => void;
  onTimeFormatChange: (format: string) => void;
  onClearFilters: () => void;
}

/**
 * Componente de filtros para as partidas
 */
const MatchesFilters: React.FC<FilterProps> = ({
  hourFilter,
  minuteFilter,
  ligaFilter,
  timeFormat,
  onHourChange,
  onMinuteChange,
  onLigaChange,
  onTimeFormatChange,
  onClearFilters
}) => {
  // Gerar opções de horas com base no formato selecionado
  const hourOptions = useMemo(() => {
    const orderedHours: React.ReactElement[] = [];
    
    // Determinar o intervalo de horas com base no formato
    let maxHour = 23;
    
    if (timeFormat === '12h') {
      maxHour = 11;
      
      // Para 12h, apenas ordem decrescente simples
      for (let i = maxHour; i >= 0; i--) {
        const hour = i.toString().padStart(2, '0');
        orderedHours.push(<option key={hour} value={hour}>{hour}</option>);
      }
    } else if (timeFormat === '6h') {
      maxHour = 5;
      
      // Para 6h, apenas ordem decrescente simples
      for (let i = maxHour; i >= 0; i--) {
        const hour = i.toString().padStart(2, '0');
        orderedHours.push(<option key={hour} value={hour}>{hour}</option>);
      }
    } else {
      // Para formato 24h, começar pela hora atual e depois em ordem decrescente
      const currentHour = new Date().getHours();
      
      // Adiciona a hora atual primeiro
      const currentHourStr = currentHour.toString().padStart(2, '0');
      orderedHours.push(<option key={currentHourStr} value={currentHourStr}>{currentHourStr}</option>);
      
      // Adiciona as horas anteriores à atual em ordem decrescente
      for (let i = currentHour - 1; i >= 0; i--) {
        const hour = i.toString().padStart(2, '0');
        orderedHours.push(<option key={hour} value={hour}>{hour}</option>);
      }
      
      // Adiciona as horas depois da atual (de 23 até currentHour+1) em ordem decrescente
      for (let i = 23; i > currentHour; i--) {
        const hour = i.toString().padStart(2, '0');
        orderedHours.push(<option key={hour} value={hour}>{hour}</option>);
      }
    }
    
    return orderedHours;
  }, [timeFormat]);

  // Gerar opções de minutos (0-59)
  const minuteOptions = useMemo(() => {
    // Obter minuto atual para referência, mas vamos ordenar todos os minutos em ordem crescente
    // pois o comportamento esperado para os minutos é diferente do das horas
    const minutes: React.ReactElement[] = [];
    
    for (let i = 0; i < 60; i++) {
      const minute = i.toString().padStart(2, '0');
      minutes.push(<option key={minute} value={minute}>{minute}</option>);
    }
    
    return minutes;
  }, []);

  // Opções de ligas disponíveis
  const ligaOptions = useMemo(() => {
    return [
      { value: 'euro', label: 'Euro' },
      { value: 'premier', label: 'Premier League' },
      { value: 'bundesliga', label: 'Bundesliga' },
      { value: 'laliga', label: 'La Liga' },
      { value: 'seriea', label: 'Serie A' }
    ];
  }, []);

  // Opções de formato de tempo
  const timeFormatOptions = useMemo(() => {
    return [
      { value: '24h', label: '24 horas' },
      { value: '12h', label: '12 horas' },
      { value: '6h', label: '6 horas' }
    ];
  }, []);

  return (
    <FilterContainer>
      <FiltersWrapper>
        <FilterGroup>
          <FilterLabel>Liga</FilterLabel>
          <FilterSelect 
            value={ligaFilter} 
            onChange={(e) => onLigaChange(e.target.value)}
          >
            {ligaOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Formato de Horas</FilterLabel>
          <FilterSelect 
            value={timeFormat} 
            onChange={(e) => onTimeFormatChange(e.target.value)}
          >
            {timeFormatOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterGroup>

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
 * Consome o hook de API para atualizações periódicas
 */
const FilterableMatchesTable: React.FC = () => {
  // Estados para os filtros
  const [hourFilter, setHourFilter] = useState<string>('');
  const [minuteFilter, setMinuteFilter] = useState<string>('');
  const [ligaFilter, setLigaFilter] = useState<string>('euro');
  const [timeFormat, setTimeFormat] = useState<string>('24h');
  const [result] = useState<string>('480'); // Valor padrão, poderia ser parametrizável também

  // Usando o hook de API para dados periódicos
  const { 
    matches, 
    loading, 
    error,
    changeParams 
  } = useMatchData(ligaFilter, result);

  // Efeito para mudar parâmetros da API quando a liga mudar
  const handleLigaChange = (liga: string) => {
    setLigaFilter(liga);
    if (changeParams) {
      changeParams(liga, result);
    }
  };

  // Quando o formato de tempo muda, reseta o filtro de hora
  const handleTimeFormatChange = (format: string) => {
    setTimeFormat(format);
    setHourFilter('');
  };

  // Aplicar filtros aos jogos
  const filteredMatches = useMemo(() => {
    if (!matches || loading || error) return [];

    return matches.filter(match => {
      try {
        const matchDate = new Date(match.StartTime);
        let matchHour = matchDate.getHours();
        const matchMinute = matchDate.getMinutes();

        // Converter hora conforme o formato selecionado
        if (timeFormat === '12h') {
          matchHour = matchHour % 12;
          if (matchHour === 0) matchHour = 12;
        } else if (timeFormat === '6h') {
          matchHour = matchHour % 6;
        }

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
  }, [matches, hourFilter, minuteFilter, timeFormat, loading, error]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setHourFilter('');
    setMinuteFilter('');
    // Não resetamos o filtro de liga aqui, apenas os filtros locais
  };

  return (
    <>
      <MatchesFilters
        hourFilter={hourFilter}
        minuteFilter={minuteFilter}
        ligaFilter={ligaFilter}
        timeFormat={timeFormat}
        onHourChange={setHourFilter}
        onMinuteChange={setMinuteFilter}
        onLigaChange={handleLigaChange}
        onTimeFormatChange={handleTimeFormatChange}
        onClearFilters={clearFilters}
      />
      
      {/* Passa os dados filtrados para o componente da tabela */}
      <MatchesTable 
        matches={filteredMatches}
        liga={ligaFilter}
        result={result}
      />
    </>
  );
};

export default FilterableMatchesTable; 