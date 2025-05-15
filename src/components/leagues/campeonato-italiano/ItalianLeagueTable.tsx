import React, { useRef, useEffect } from 'react';
import { 
  TableContainer, 
  Table, 
  HeaderRow, 
  HeaderCell, 
  DataRow, 
  DataCell, 
  Score, 
  SummaryCell, 
  MinuteCell, 
  HourCell,
  GreenPercentage,
  LoadingMessage
} from '../../TableVirtualFootball/styles';
import { CellColorProps } from '../../TableVirtualFootball/types';
import { useItalianMatchData, useItalianTimeTable } from '../../../hooks';
import { IMatch } from '../../../services/api';
import { useFilterContext } from '../../Filters';

// Interface para os minutos no cabeçalho horizontal
interface IMinute {
  value: string;
}

// Interface para os percentuais de cabeçalho
interface IHeaderPercentage {
  value: string;
  fraction: string;
  color?: 'green' | 'red';
}

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

// Função para obter a cor da célula com base no resultado
const getCellColor = (isHome: boolean | undefined): CellColorProps => {
  if (isHome === undefined) {
    return { color: 'gray' };
  }
  return { color: isHome ? 'green' : 'red' };
};

// Função para determinar se um placar representa vitória do mandante
const isHomeWin = (homeScore: number, awayScore: number): boolean | undefined => {
  if (homeScore === 0 && awayScore === 0) return undefined; // Sem dados
  return homeScore > awayScore;
};

/**
 * Componente de Tabela específico para o Campeonato Italiano
 * Com minutos diferentes da Euro League e utilizando a API específica do Campeonato Italiano
 */
const ItalianLeagueTable: React.FC<ItalianLeagueTableProps> = ({ leagueId, leagueName }) => {
  // Obter configurações de filtro
  const { hoursFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API específica do Campeonato Italiano
  const { matches, loading, error, lastUpdated, isBackgroundRefreshing } = useItalianMatchData();
  
  // Estado para exibir indicador de atualização recente
  const [showUpdateIndicator, setShowUpdateIndicator] = React.useState(false);
  
  // Referência para armazenar o último horário de atualização
  const lastUpdatedRef = React.useRef<Date | null>(null);
  
  // Determinar quais horas mostrar baseado no filtro (em ordem decrescente)
  const currentHour = new Date().getHours();
  
  // Efeito para contar atualizações
  useEffect(() => {
    if (lastUpdated && (!lastUpdatedTimeRef.current || lastUpdated > lastUpdatedTimeRef.current)) {
      lastUpdatedTimeRef.current = lastUpdated;
      setUpdateCount(prev => prev + 1);
    }
  }, [lastUpdated]);
  
  // Efeito para mostrar um indicador visual quando os dados são atualizados
  React.useEffect(() => {
    if (lastUpdated && (!lastUpdatedRef.current || lastUpdated > lastUpdatedRef.current)) {
      // Atualização dos dados detectada
      lastUpdatedRef.current = lastUpdated;
      setShowUpdateIndicator(true);
      
      // Remover o indicador após 2 segundos
      const timer = setTimeout(() => {
        setShowUpdateIndicator(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);
  
  // Função para ordenar horas na sequência correta da tabela
  const sortHoursInCorrectOrder = (hours: number[]): number[] => {
    // Primeiro garantir que a hora atual seja a primeira da lista
    const sortedHours = [...hours];
    
    // Remover a hora atual da lista se existir
    const currentHourIndex = sortedHours.indexOf(currentHour);
    if (currentHourIndex !== -1) {
      sortedHours.splice(currentHourIndex, 1);
    }
    
    // Ordenar todas as horas em ordem decrescente a partir da hora atual
    // Horas menores que a atual (em ordem decrescente)
    const hoursBelowCurrent = sortedHours
      .filter(h => h < currentHour)
      .sort((a, b) => b - a);
    
    // Horas maiores que a atual (em ordem decrescente)
    const hoursAboveCurrent = sortedHours
      .filter(h => h > currentHour)
      .sort((a, b) => b - a);
    
    // Retornar com a hora atual como primeira, seguida das outras horas em ordem decrescente
    return [currentHour, ...hoursBelowCurrent, ...hoursAboveCurrent];
  };
  
  const filteredHours = React.useMemo(() => {
    // Gerar um array com as horas que queremos mostrar
    const hours: number[] = [];
    
    // Adicionar as horas a partir da hora atual até o número definido pelo filtro
    for (let i = 0; i < Math.min(hoursFilter, 24); i++) {
      let hour = currentHour - i;
      // Ajustar horas negativas (ex: se for 1h e quisermos mostrar 3h antes, precisamos mostrar 23, 0, 1)
      if (hour < 0) {
        hour = 24 + hour;
      }
      hours.push(hour);
    }
    
    // Ordenar as horas com a hora atual primeiro, seguida das anteriores em ordem decrescente
    return sortHoursInCorrectOrder(hours);
  }, [currentHour, hoursFilter]);
  
  // Processar os dados da tabela usando o hook useItalianTimeTable
  const { cells } = useItalianTimeTable(matches, true, undefined, filteredHours);
  
  // Contadores para estatísticas por hora
  const hourStats = React.useMemo(() => {
    const stats: Record<number, { total: number; wins: number; }> = {};
    
    // Inicializar estatísticas para todas as horas filtradas
    filteredHours.forEach(hour => {
      stats[hour] = { total: 0, wins: 0 };
    });
    
    // Calcular estatísticas a partir das células
    Object.keys(cells).forEach(cellKey => {
      const [hourStr, minuteStr] = cellKey.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      if (filteredHours.includes(hour)) {
        const cellMatches = cells[cellKey].matches;
        
        cellMatches.forEach(match => {
          const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
          const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
          
          stats[hour].total += 1;
          if (homeScore > awayScore) {
            stats[hour].wins += 1;
          }
        });
      }
    });
    
    return stats;
  }, [cells, filteredHours]);
  
  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => (
    <HeaderRow>
      <HeaderCell>Hora<br/>Minuto</HeaderCell>
      {italianMinutes.map((minute, index) => (
        <MinuteCell key={`minute-${index}`}>{minute.value}</MinuteCell>
      ))}
      <HeaderCell>%</HeaderCell>
      <HeaderCell>Greens</HeaderCell>
      <HeaderCell>Σ</HeaderCell>
    </HeaderRow>
  );

  // Renderiza as células com dados de jogos
  const renderCell = (hour: number, minuteStr: string) => {
    const minute = parseInt(minuteStr);
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    
    if (!cellData || cellData.matches.length === 0) {
      return (
        <DataCell key={`cell-${minuteStr}`} {...getCellColor(undefined)}>
          <Score>{'-'}</Score>
        </DataCell>
      );
    }
    
    // Pegar o primeiro jogo da célula (normalmente só há um por hora/minuto)
    const match = cellData.matches[0];
    const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    const homeWin = isHomeWin(homeScore, awayScore);
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...getCellColor(homeWin)}>
        <Score>{`${homeScore}-${awayScore}`}</Score>
      </DataCell>
    );
  };
  
  // Renderiza uma linha de dados para uma hora específica
  const renderDataRow = (hour: number) => {
    const hourTotal = hourStats[hour]?.total || 0;
    const hourWins = hourStats[hour]?.wins || 0;
    
    // Calcular porcentagem de vitórias do mandante para esta hora
    const winPercentage = hourTotal > 0 ? Math.round((hourWins / hourTotal) * 100) : 0;
    
    // Formatar string de fração para exibição
    const winFraction = `${hourWins}/${hourTotal}`;
    
    return (
      <DataRow key={`hour-${hour}`}>
        <HourCell>{hour < 10 ? `0${hour}` : hour}</HourCell>
        
        {italianMinutes.map((minute) => renderCell(hour, minute.value))}
        
        <SummaryCell>
          <GreenPercentage>{`${winPercentage}%`}</GreenPercentage>
        </SummaryCell>
        
        <SummaryCell>
          {hourWins}
        </SummaryCell>
        
        <SummaryCell>
          {hourTotal}
        </SummaryCell>
      </DataRow>
    );
  };
  
  // Se for a carga inicial (loading=true e não temos dados ainda), mostrar o indicador de carregamento
  if (loading && matches.length === 0) {
    return (
      <TableContainer>
        <LoadingMessage>
          <div style={{ textAlign: 'center' }}>
            <div>Carregando dados da {leagueName}...</div>
          </div>
        </LoadingMessage>
      </TableContainer>
    );
  }
  
  // Exibir mensagem de erro, se houver
  if (error && matches.length === 0) {
    return (
      <TableContainer>
        <LoadingMessage>Erro ao carregar dados da {leagueName}: {error.message}</LoadingMessage>
      </TableContainer>
    );
  }

  // Renderizar a tabela completa
  return (
    <TableContainer>
      <Table>
        {renderMinutesHeader()}
        <tbody>
          {filteredHours.map(hour => renderDataRow(hour))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default ItalianLeagueTable; 