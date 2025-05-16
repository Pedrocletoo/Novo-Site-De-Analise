import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../contexts/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useCachedMatchData } from '../../hooks/useCachedMatchData';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga América Latina
 * Mostrando minutos em sequência: 02, 05, 08, etc até 59
 */
const americaLatinaMinutes: IMinute[] = [
  { value: '02' }, { value: '05' }, { value: '08' }, { value: '11' },
  { value: '14' }, { value: '17' }, { value: '20' }, { value: '23' },
  { value: '26' }, { value: '29' }, { value: '32' }, { value: '35' },
  { value: '38' }, { value: '41' }, { value: '44' }, { value: '47' },
  { value: '50' }, { value: '53' }, { value: '56' }, { value: '59' }
];

/**
 * Interface para as propriedades do componente AmericaLatinaLeagueTable
 */
interface AmericaLatinaLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente AmericaLatinaLeagueTable para BR4
 * Usa os hooks reutilizáveis para obter e processar dados
 * Utilizando o cache centralizado para atualizações automáticas
 */
const AmericaLatinaLeagueTable: React.FC<AmericaLatinaLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter } = useBR4FilterContext();
  
  // Buscar dados da API para América Latina usando cache centralizado
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing,
    isLive
  } = useCachedMatchData('br4-america-latina', '720');
  
  // Processar dados para a tabela
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    americaLatinaMinutes
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
      minutes={americaLatinaMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default AmericaLatinaLeagueTable; 