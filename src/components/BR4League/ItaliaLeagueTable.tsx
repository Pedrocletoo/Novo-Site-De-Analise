import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../contexts/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga Italia
 * Mostrando minutos ímpares de 01 a 59 em incrementos de 2
 */
const italiaMinutes: IMinute[] = [
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
 * Interface para as propriedades do componente ItaliaLeagueTable
 */
interface ItaliaLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente ItaliaLeagueTable para BR4
 * Usa os hooks reutilizáveis para obter e processar dados
 */
const ItaliaLeagueTable: React.FC<ItaliaLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter } = useBR4FilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API para Italia
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing 
  } = useMatchData('br4-italy', '720');
  
  // Processar dados para a tabela
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    italiaMinutes
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
      minutes={italiaMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default ItaliaLeagueTable;