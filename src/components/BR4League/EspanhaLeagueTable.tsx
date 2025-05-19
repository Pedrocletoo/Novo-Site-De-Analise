import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../components/Filters/br4/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useCachedMatchData } from '../../hooks/useCachedMatchData';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga Espanha
 * Mostrando minutos ímpares de 01 a 59 em incrementos de 2
 */
const espanhaMinutes: IMinute[] = [
  { value: '01' }, { value: '03' }, { value: '05' }, { value: '07' },
  { value: '09' }, { value: '11' }, { value: '13' }, { value: '15' },
  { value: '17' }, { value: '19' }, { value: '21' }, { value: '23' },
  { value: '25' }, { value: '27' }, { value: '29' }, { value: '31' },
  { value: '33' }, { value: '35' }, { value: '37' }, { value: '39' },
  { value: '41' }, { value: '43' }, { value: '45' }, { value: '47' },
  { value: '49' }, { value: '51' }, { value: '53' }, { value: '55' },
  { value: '57' }, { value: '59' }
];

/**
 * Interface para as propriedades do componente EspanhaLeagueTable
 */
interface EspanhaLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente EspanhaLeagueTable para BR4
 * Usa o hook de cache centralizado para atualizações automáticas
 */
const EspanhaLeagueTable: React.FC<EspanhaLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter, marketFilters } = useBR4FilterContext();
  
  // Buscar dados usando cache centralizado
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing,
    isLive 
  } = useCachedMatchData('br4-spain', '720');
  
  // Processar dados para a tabela
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    espanhaMinutes
  );
  
  return (
    <BaseLeagueTable
      leagueId={leagueId}
      leagueName={leagueName}
      matches={matches}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isBackgroundRefreshing={isBackgroundRefreshing}
      isLiveConnection={isLive}
      minutes={espanhaMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true, marketFilters }}
    />
  );
};

export default EspanhaLeagueTable; 