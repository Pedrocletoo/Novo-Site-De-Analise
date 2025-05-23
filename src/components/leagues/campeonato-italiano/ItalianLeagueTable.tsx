import React, { useRef, useEffect } from 'react';
import { useItalianTimeTable } from '../../../hooks/useItalianTimeTable';
import { useFilterContext } from '../../Filters';
import BaseLeagueTable, { IMinute } from '../shared/BaseLeagueTable';
import { useCachedMatchData } from '../../../hooks/useCachedMatchData';

/**
 * Interface para as propriedades do componente ItalianLeagueTable
 */
interface ItalianLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal específicos para o Campeonato Italiano
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const italianMinutes: IMinute[] = [
  { value: '02' }, { value: '05' }, { value: '08' }, { value: '11' },
  { value: '14' }, { value: '17' }, { value: '20' }, { value: '23' },
  { value: '26' }, { value: '29' }, { value: '32' }, { value: '35' },
  { value: '38' }, { value: '41' }, { value: '44' }, { value: '47' },
  { value: '50' }, { value: '53' }, { value: '56' }, { value: '59' }
];

/**
 * Componente de Tabela específico para o Campeonato Italiano
 * Com minutos diferentes da Euro League e utilizando o cache centralizado
 */
const ItalianLeagueTable: React.FC<ItalianLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Buscar dados usando o hook de cache centralizado
  const { 
    matches, 
    loading, 
    error, 
    lastUpdated, 
    isBackgroundRefreshing,
    isLive
  } = useCachedMatchData('campeonato-italiano');
  
  // Processar dados para a tabela usando o hook específico do Campeonato Italiano
  const { 
    hours: filteredHours, 
    cells 
  } = useItalianTimeTable(matches, hoursFilter);
  
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
      minutes={italianMinutes}
      filteredHours={filteredHours}
      cells={cells}
      renderOptions={{ showDrawAsRed: true }}
    />
  );
};

export default ItalianLeagueTable; 