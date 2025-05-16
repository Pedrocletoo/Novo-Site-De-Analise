import React, { useRef, useEffect } from 'react';
import { useTacaGloriaEternaTable, FIXED_MINUTE_BLOCKS } from '../../../hooks/useTacaGloriaEternaTable';
import { useFilterContext } from '../../Filters';
import BaseLeagueTable, { IMinute } from '../shared/BaseLeagueTable';
import { useCachedMatchData } from '../../../hooks/useCachedMatchData';

/**
 * Interface para as propriedades do componente TacaGloriaEternaTable
 */
interface TacaGloriaEternaTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Taça Glória Eterna
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const tacaGloriaEternaMinutes: IMinute[] = FIXED_MINUTE_BLOCKS.map(minute => ({
  value: minute.toString().padStart(2, '0')
}));

/**
 * Componente de Tabela específico para a Taça Glória Eterna
 * Agora utilizando o cache centralizado para carregamento instantâneo
 */
const TacaGloriaEternaTable: React.FC<TacaGloriaEternaTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados usando o hook de cache centralizado
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing,
    isLive
  } = useCachedMatchData('taca-gloria-eterna');
  
  // Processar dados para a tabela usando o hook específico da Taça Glória Eterna
  const { 
    hours: filteredHours, 
    cells 
  } = useTacaGloriaEternaTable(matches, hoursFilter);
  
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
      isLiveConnection={isLive}
      minutes={tacaGloriaEternaMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default TacaGloriaEternaTable; 