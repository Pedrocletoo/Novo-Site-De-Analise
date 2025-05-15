import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../contexts/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga América Latina
 * Mostrando minutos em sequência: 02, 05, 08, etc até 59
 * Mantendo o mesmo padrão da tabela do Brasil
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
 */
const AmericaLatinaLeagueTable: React.FC<AmericaLatinaLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter } = useBR4FilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Converter minutos de string para números inteiros para comparação correta
  const numericMinutes = React.useMemo(() => {
    return americaLatinaMinutes.map(m => ({ value: String(parseInt(m.value)) }));
  }, []);
  
  // Buscar dados da API para América Latina
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing 
  } = useMatchData('br4-america-latina', '720');
  
  // Processar dados para a tabela usando os minutos corretos
  const { 
    hours: filteredHours, 
    cells 
  } = useTimeTable(
    matches,
    hoursFilter,
    numericMinutes // Usar a versão numérica dos minutos
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
      minutes={americaLatinaMinutes} // Usar a versão original para exibição
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default AmericaLatinaLeagueTable; 