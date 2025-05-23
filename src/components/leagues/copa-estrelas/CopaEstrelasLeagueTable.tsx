import React, { useRef, useEffect } from 'react';
import { useCopaEstrelasMatchData } from '../../../hooks';
import { useCopaEstrelasTimeTable } from '../../../hooks/useCopaEstrelasTimeTable';
import { useFilterContext } from '../../Filters';
import BaseLeagueTable, { IMinute } from '../shared/BaseLeagueTable';

/**
 * Interface para as propriedades do componente CopaEstrelasLeagueTable
 */
interface CopaEstrelasLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Copa das Estrelas
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const copaEstrelasMinutes: IMinute[] = [
  { value: '00' }, { value: '03' }, { value: '06' }, { value: '09' },
  { value: '12' }, { value: '15' }, { value: '18' }, { value: '21' },
  { value: '24' }, { value: '27' }, { value: '30' }, { value: '33' },
  { value: '36' }, { value: '39' }, { value: '42' }, { value: '45' },
  { value: '48' }, { value: '51' }, { value: '54' }, { value: '57' }
];

/**
 * Componente de Tabela específico para a Copa das Estrelas
 * Com dados da API, exibindo resultados dos jogos nas células corretas
 */
const CopaEstrelasLeagueTable: React.FC<CopaEstrelasLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API específica da Copa das Estrelas
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated,
    isBackgroundRefreshing
  } = useCopaEstrelasMatchData();
  
  // Processar dados para a tabela usando o hook específico da Copa das Estrelas
  const { 
    hours: filteredHours, 
    cells 
  } = useCopaEstrelasTimeTable(matches, hoursFilter);
  
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
      minutes={copaEstrelasMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default CopaEstrelasLeagueTable; 