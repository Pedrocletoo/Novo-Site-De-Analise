import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../contexts/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga Inglaterra
 * Mostrando minutos pares de 00 a 58 em incrementos de 2
 */
const inglaterraMinutes: IMinute[] = [
  { value: '00' }, { value: '02' }, { value: '04' }, { value: '06' },
  { value: '08' }, { value: '10' }, { value: '12' }, { value: '14' },
  { value: '16' }, { value: '18' }, { value: '20' }, { value: '22' },
  { value: '24' }, { value: '26' }, { value: '28' }, { value: '30' },
  { value: '32' }, { value: '34' }, { value: '36' }, { value: '38' },
  { value: '40' }, { value: '42' }, { value: '44' }, { value: '46' },
  { value: '48' }, { value: '50' }, { value: '52' }, { value: '54' },
  { value: '56' }, { value: '58' }
];

/**
 * Interface para as propriedades do componente InglaterraLeagueTable
 */
interface InglaterraLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente InglaterraLeagueTable para BR4
 * Usa os hooks reutilizáveis para obter e processar dados
 */
const InglaterraLeagueTable: React.FC<InglaterraLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter } = useBR4FilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API para Inglaterra
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing 
  } = useMatchData('br4-england', '720');
  
  // Processar dados para a tabela
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    inglaterraMinutes
  );
  
  // Efeito para contar atualizações
  React.useEffect(() => {
    if (lastUpdated && (!lastUpdatedTimeRef.current || lastUpdated > lastUpdatedTimeRef.current)) {
      lastUpdatedTimeRef.current = lastUpdated;
      setUpdateCount(prev => prev + 1);
    }
  }, [lastUpdated]);
  
  return (
    <BaseLeagueTable
      leagueId={leagueId}
      leagueName={leagueName}
      matches={matches}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isBackgroundRefreshing={isBackgroundRefreshing}
      minutes={inglaterraMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default InglaterraLeagueTable; 