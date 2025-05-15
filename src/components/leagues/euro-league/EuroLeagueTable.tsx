import React, { useRef } from 'react';
import { useMatchData } from '../../../hooks';
import { useTimeTable } from '../../../hooks/useTimeTable';
import { useFilterContext } from '../../Filters';
import BaseLeagueTable, { IMinute } from '../shared/BaseLeagueTable';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Euro League
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const euroMinutes: IMinute[] = [
  { value: '01' }, { value: '04' }, { value: '07' }, { value: '10' },
  { value: '13' }, { value: '16' }, { value: '19' }, { value: '22' },
  { value: '25' }, { value: '28' }, { value: '31' }, { value: '34' },
  { value: '37' }, { value: '40' }, { value: '43' }, { value: '46' },
  { value: '49' }, { value: '52' }, { value: '55' }, { value: '58' }
];

/**
 * Interface para as propriedades do componente EuroLeagueTable
 */
interface EuroLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente EuroLeagueTable usando a nova estrutura com BaseLeagueTable
 * Mantém todas as funcionalidades anteriores mas com código mais organizado
 */
const EuroLeagueTable: React.FC<EuroLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API para Euro League
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing 
  } = useMatchData(leagueId, '480');
  
  // Processar dados para a tabela
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    euroMinutes
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
      minutes={euroMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default EuroLeagueTable; 