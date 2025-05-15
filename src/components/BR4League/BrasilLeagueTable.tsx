import React, { useRef } from 'react';
import { useBR4FilterContext } from '../../contexts/BR4FilterContext';
import BaseLeagueTable, { IMinute } from '../leagues/shared/BaseLeagueTable';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Liga Brasil
 * Mostrando minutos em sequência: 02, 05, 08, etc até 59
 */
const brasilMinutes: IMinute[] = [
  { value: '02' }, { value: '05' }, { value: '08' }, { value: '11' },
  { value: '14' }, { value: '17' }, { value: '20' }, { value: '23' },
  { value: '26' }, { value: '29' }, { value: '32' }, { value: '35' },
  { value: '38' }, { value: '41' }, { value: '44' }, { value: '47' },
  { value: '50' }, { value: '53' }, { value: '56' }, { value: '59' }
];

/**
 * Interface para as propriedades do componente BrasilLeagueTable
 */
interface BrasilLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Componente BrasilLeagueTable para BR4
 * Usa os hooks reutilizáveis para obter e processar dados
 */
const BrasilLeagueTable: React.FC<BrasilLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro do contexto BR4
  const { hoursFilter } = useBR4FilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Converter minutos de string para números inteiros para comparação correta
  const numericMinutes = React.useMemo(() => {
    return brasilMinutes.map(m => ({ value: String(parseInt(m.value)) }));
  }, []);
  
  // Buscar dados da API para Brasil
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing 
  } = useMatchData('br4-brasil', '720');
  
  // Log para depuração
  React.useEffect(() => {
    if (matches.length > 0) {
      console.log('Matches recebidos para Brasil:', matches.length);
      console.log('Exemplo de match:', matches[0]);
      
      // Ver os minutos de todos os jogos para depuração
      const gameMinutes = matches.map(match => {
        const date = new Date(match.StartTime);
        return date.getMinutes();
      });
      
      console.log('Minutos dos jogos (primeiros 10):', gameMinutes.slice(0, 10));
      console.log('Minutos na tabela (string):', brasilMinutes.map(m => m.value));
      console.log('Minutos na tabela (numericos):', numericMinutes.map(m => m.value));
    }
  }, [matches, numericMinutes]);
  
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
  
  // Log para depuração de células
  React.useEffect(() => {
    console.log('Células processadas para Brasil:', Object.keys(cells).length);
    // Verificar se temos células com jogos
    const cellsWithMatches = Object.values(cells).filter(cell => cell.matches.length > 0);
    console.log('Células com jogos:', cellsWithMatches.length);
    
    if (cellsWithMatches.length === 0) {
      // Se não houver células com jogos, verificar novamente os minutos
      const minutesInTable = numericMinutes.map(m => parseInt(m.value)).sort((a, b) => a - b);
      console.log('Minutos configurados na tabela (numéricos):', minutesInTable);
    }
  }, [cells, numericMinutes]);
  
  return (
    <BaseLeagueTable
      leagueId={leagueId}
      leagueName={leagueName}
      matches={matches}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      isBackgroundRefreshing={isBackgroundRefreshing}
      minutes={brasilMinutes} // Usar a versão original para exibição
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default BrasilLeagueTable; 