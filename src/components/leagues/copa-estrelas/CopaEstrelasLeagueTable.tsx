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
import { useCopaEstrelasMatchData, useCopaEstrelasTimeTable } from '../../../hooks';
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

interface CopaEstrelasLeagueTableProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal específicos para a Copa das Estrelas
 * Esta liga usa um padrão único de minutos: 00, 03, 06, etc.
 */
const copaEstrelasMinutes: IMinute[] = [
  { value: '00' }, { value: '03' }, { value: '06' }, { value: '09' },
  { value: '12' }, { value: '15' }, { value: '18' }, { value: '21' },
  { value: '24' }, { value: '27' }, { value: '30' }, { value: '33' },
  { value: '36' }, { value: '39' }, { value: '42' }, { value: '45' },
  { value: '48' }, { value: '51' }, { value: '54' }, { value: '57' }
];

// Função para obter a cor da célula com base no resultado
const getCellColor = (isHome: boolean | undefined): CellColorProps => {
  if (isHome === undefined) {
    return { color: 'gray' };
  }
  return { color: isHome ? 'green' : 'red' };
};

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
    minuteBlocks, 
    cells 
  } = useCopaEstrelasTimeTable(matches, false);
  
  // Estado para exibir indicador de atualização recente
  const [showUpdateIndicator, setShowUpdateIndicator] = React.useState(false);
  
  // Referência para armazenar o último horário de atualização
  const lastUpdatedRef = React.useRef<Date | null>(null);
  
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
  
  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => (
    <HeaderRow>
      <HeaderCell>Hora<br/>Minuto</HeaderCell>
      {copaEstrelasMinutes.map((minute, index) => (
        <MinuteCell key={`minute-${index}`}>{minute.value}</MinuteCell>
      ))}
      <HeaderCell>%</HeaderCell>
      <HeaderCell>Greens</HeaderCell>
      <HeaderCell>Σ</HeaderCell>
    </HeaderRow>
  );

  // Função para obter o resultado de uma célula
  const getCellResult = (hour: number, minuteStr: string) => {
    const minute = parseInt(minuteStr);
    const cellKey = `${hour}:${minute}`;
    const cell = cells[cellKey];
    
    if (!cell || cell.matches.length === 0) {
      return { isHome: undefined, score: '-' };
    }
    
    // Usar a primeira partida encontrada
    const match = cell.matches[0];
    
    // Verificar se os dados do placar estão disponíveis
    if (match.FullTimeHomeTeam === undefined || match.FullTimeAwayTeam === undefined) {
      return { isHome: undefined, score: '-' };
    }
    
    // Determinar o vencedor - home (casa) ou away (visitante)
    const homeScore = parseInt(match.FullTimeHomeTeam);
    const awayScore = parseInt(match.FullTimeAwayTeam);
    
    // Se os dados do placar são válidos, determinar vencedor
    if (!isNaN(homeScore) && !isNaN(awayScore)) {
      // true = time da casa venceu, false = time visitante venceu
      const isHome = homeScore > awayScore;
      const score = `${homeScore}-${awayScore}`;
      return { isHome, score };
    }
    
    return { isHome: undefined, score: '-' };
  };
  
  // Renderiza uma célula com dados
  const renderCell = (hour: number, minuteStr: string) => {
    const { isHome, score } = getCellResult(hour, minuteStr);
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...getCellColor(isHome)}>
        <Score>{score}</Score>
      </DataCell>
    );
  };
  
  // Função para calcular estatísticas da linha
  const calculateRowStats = (hour: number) => {
    let greenCount = 0;
    let totalGames = 0;
    
    // Percorrer todos os minutos nesta hora e contar jogos finalizados e resultados green
    copaEstrelasMinutes.forEach(minute => {
      const { isHome } = getCellResult(hour, minute.value);
      
      // Se tiver resultado definido (não undefined), é um jogo válido
      if (isHome !== undefined) {
        totalGames++;
        // Se for true, é um resultado green (time da casa venceu)
        if (isHome === true) {
          greenCount++;
        }
      }
    });
    
    // Calcular porcentagem de greens, evitando divisão por zero
    const greenPercentage = totalGames > 0 
      ? Math.round((greenCount / totalGames) * 100) 
      : 0;
    
    return {
      greenCount,
      totalGames,
      greenPercentage: `${greenPercentage}%`,
      totalSum: totalGames // Total de jogos válidos
    };
  };
  
  // Renderiza uma linha de dados para uma hora específica
  const renderDataRow = (hour: number) => {
    // Calcular estatísticas da linha
    const { greenCount, totalGames, greenPercentage, totalSum } = calculateRowStats(hour);
    
    return (
      <DataRow key={`hour-${hour}`}>
        <HourCell>{hour < 10 ? `0${hour}` : hour}</HourCell>
        
        {copaEstrelasMinutes.map((minute) => renderCell(hour, minute.value))}
        
        <SummaryCell>
          <GreenPercentage>{greenPercentage}</GreenPercentage>
        </SummaryCell>
        
        <SummaryCell>
          {greenCount}
        </SummaryCell>
        
        <SummaryCell>
          {totalSum}
        </SummaryCell>
      </DataRow>
    );
  };
  
  // Renderizar a tabela completa
  return (
    <TableContainer>
      {loading && matches.length === 0 && <LoadingMessage>Carregando dados...</LoadingMessage>}
      
      <Table>
        {renderMinutesHeader()}
        <tbody>
          {filteredHours.slice(0, hoursFilter).map(hour => renderDataRow(hour))}
        </tbody>
      </Table>
      
      {error && <div style={{ color: 'red', marginTop: '10px' }}>Erro: {error.message}</div>}
    </TableContainer>
  );
};

export default CopaEstrelasLeagueTable; 