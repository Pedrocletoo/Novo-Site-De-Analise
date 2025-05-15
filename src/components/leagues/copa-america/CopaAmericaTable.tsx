import React, { useRef, useEffect } from 'react';
import { useMatchData } from '../../../hooks';
import { useCopaAmericaTable } from '../../../hooks/useCopaAmericaTable';
import { useFilterContext } from '../../Filters';
import BaseLeagueTable, { IMinute } from '../shared/BaseLeagueTable';

/**
 * Interface para as propriedades do componente CopaAmericaTable
 */
interface CopaAmericaTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Copa América
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const copaAmericaMinutes: IMinute[] = [
  { value: '02' }, { value: '05' }, { value: '08' }, { value: '11' },
  { value: '14' }, { value: '17' }, { value: '20' }, { value: '23' },
  { value: '26' }, { value: '29' }, { value: '32' }, { value: '35' },
  { value: '38' }, { value: '41' }, { value: '44' }, { value: '47' },
  { value: '50' }, { value: '53' }, { value: '56' }, { value: '59' }
];

/**
 * Componente de Tabela específico para Copa América
 */
const CopaAmericaTable: React.FC<CopaAmericaTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API usando o hook padrão - não precisa do específico
  const { matches, loading, error, lastUpdated, isBackgroundRefreshing } = useMatchData(leagueId, '480');
  
  // Processar dados para a tabela usando o hook específico da Copa América
  const { 
    hours: filteredHours, 
    cells 
  } = useCopaAmericaTable(matches, hoursFilter);
  
  // Efeito para contar atualizações
  useEffect(() => {
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
      minutes={copaAmericaMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default CopaAmericaTable;