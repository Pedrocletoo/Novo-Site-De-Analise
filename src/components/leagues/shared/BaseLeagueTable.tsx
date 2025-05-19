import React, { useRef, useEffect } from 'react';
import {
  TableContainer,
  Table,
  HeaderRow,
  HeaderCell,
  HourCell,
  MinuteCell,
  DataRow,
  DataCell,
  SummaryCell,
  Score,
  HalfTimeScore,
  GreenPercentage,
  LoadingMessage
} from '../../TableVirtualFootball/styles';
import { CellColorProps, CellColor } from '../../TableVirtualFootball/types';
import { IMatch } from '../../../services/api';
import { useFilterContext } from '../../Filters';
import { MarketFilterState, MarketFilterType } from '../../Filters/types';
import { calculateRowStats, TableCell, isGreenPercentage } from '../../../utils/tableStats';
import { useTimeFilter, TimeFilterOption } from '../../Filters/common/TimeFilter';

/**
 * Interface para os minutos no cabeçalho horizontal
 */
export interface IMinute {
  value: string;
}

/**
 * Interface para opções de renderização de partidas
 */
export interface IMatchRenderOptions {
  showDrawAsRed?: boolean;
  marketFilters?: Record<MarketFilterType, MarketFilterState>;
}

/**
 * Interface para propriedades básicas de todas as tabelas de liga
 */
export interface BaseLeagueTableProps {
  // Dados e estado
  leagueId: string;
  leagueName: string;
  matches: IMatch[];
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isBackgroundRefreshing?: boolean;
  isLiveConnection?: boolean;
  
  // Configurações de exibição
  minutes: IMinute[];
  filteredHours: number[];
  cells: Record<string, { matches: IMatch[] }>;
  hourStats?: Record<number, { total: number; wins: number }>;
  
  // Configurações de renderização
  renderOptions?: IMatchRenderOptions;
  
  // Componentes customizáveis (opcionais)
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
}

/**
 * Função para obter a cor da célula com base no resultado da partida
 * e nos filtros de mercado ativados
 */
export const getCellColor = (
  isHome: boolean | null | undefined, 
  match?: IMatch,
  options?: IMatchRenderOptions,
  currentTimeFilter?: TimeFilterOption
): CellColorProps => {
  // Se não houver partida, retornar branco
  if (!match) {
    return { color: 'white' };
  }
  
  // Determinar quais scores usar com base no filtro de tempo
  let homeScore: number;
  let awayScore: number;
  
  // Scores do primeiro tempo (HT)
  const htHomeScore = parseInt(match.HalfTimeHomeTeam) || 0;
  const htAwayScore = parseInt(match.HalfTimeAwayTeam) || 0;
  
  // Scores do resultado final (FT)
  const ftHomeScore = parseInt(match.FullTimeHomeTeam) || 0;
  const ftAwayScore = parseInt(match.FullTimeAwayTeam) || 0;
  
  if (currentTimeFilter === 'HT') {
    homeScore = htHomeScore;
    awayScore = htAwayScore;
  } else {
    // Para FT ou HT+FT, usamos o resultado final para determinar as cores
    homeScore = ftHomeScore;
    awayScore = ftAwayScore;
  }
  
  const totalGols = homeScore + awayScore;
  
  // Verificar se ambos os times marcaram
  const ambasMarcaram = homeScore > 0 && awayScore > 0;
  
  // Verificar qual filtro está ativo
  if (options?.marketFilters) {
    // Filtro "Ambas Marcam"
    if (options.marketFilters.ambasMarcam?.active) {
      const ambasMarcamValue = options.marketFilters.ambasMarcam.value;
      
      if (ambasMarcamValue === 'sim') {
        return { color: ambasMarcaram ? 'green' : 'red' };
      } else if (ambasMarcamValue === 'nao') {
        return { color: !ambasMarcaram ? 'green' : 'red' };
      }
    }
    
    // Filtro "Over"
    if (options.marketFilters.over?.active) {
      const overValue = parseFloat(options.marketFilters.over.value);
      return { color: totalGols > overValue ? 'green' : 'red' };
    }
    
    // Filtro "Under"
    if (options.marketFilters.under?.active) {
      const underValue = parseFloat(options.marketFilters.under.value);
      return { color: totalGols < underValue ? 'green' : 'red' };
    }
    
    // Filtro "Total de Gols"
    if (options.marketFilters.totalGols?.active) {
      const totalGoalsValue = parseInt(options.marketFilters.totalGols.value);
      return { color: totalGols === totalGoalsValue ? 'green' : 'red' };
    }
    
    // Filtro "Viradinha"
    if (options.marketFilters.viradinha?.active) {
      // Scores do primeiro tempo (HT)
      const htHomeScore = parseInt(match.HalfTimeHomeTeam) || 0;
      const htAwayScore = parseInt(match.HalfTimeAwayTeam) || 0;
      
      // Scores do resultado final (FT)
      const ftHomeScore = parseInt(match.FullTimeHomeTeam) || 0;
      const ftAwayScore = parseInt(match.FullTimeAwayTeam) || 0;
      
      // Vencedor do primeiro tempo (HT)
      const htWinner = htHomeScore > htAwayScore ? 'home' : htHomeScore < htAwayScore ? 'away' : 'draw';
      
      // Vencedor do resultado final (FT)
      const ftWinner = ftHomeScore > ftAwayScore ? 'home' : ftHomeScore < ftAwayScore ? 'away' : 'draw';
      
      // Viradinha ocorre quando:
      // 1. Alguém está ganhando no primeiro tempo (não empate)
      // 2. O resultado final não é empate
      // 3. O vencedor do primeiro tempo é diferente do vencedor final
      const hasVirada = htWinner !== 'draw' && ftWinner !== 'draw' && htWinner !== ftWinner;
      
      // Cores baseadas na presença de viradinha
      return { color: hasVirada ? 'green' : 'red' };
    }
  }
  
  // Se nenhum filtro estiver ativo ou se o filtro ativo não for reconhecido, manter cor branca
  return { color: 'white' };
};

/**
 * Verifica se o time da casa venceu a partida
 */
export const isHomeWin = (homeScore: number, awayScore: number): boolean | null => {
  if (homeScore > awayScore) return true;
  if (homeScore < awayScore) return false;
  return null; // Empate
};

/**
 * Componente Base para Tabelas de Ligas
 * Contém a estrutura e lógica comum a todas as tabelas
 */
const BaseLeagueTable: React.FC<BaseLeagueTableProps> = ({
  leagueId,
  leagueName,
  matches,
  loading,
  error,
  lastUpdated,
  isBackgroundRefreshing,
  isLiveConnection,
  minutes,
  filteredHours,
  cells,
  hourStats,
  renderOptions = {},
  customHeader,
  customFooter
}) => {
  // Definir configurações de renderização
  // Se não foram passados filtros específicos via props, usar o contexto global
  const globalFilters = useFilterContext();
  
  // Obter o tipo de filtro de tempo atual
  const { timeFilter } = useTimeFilter();
  
  // Verificar se já temos filtros nas renderOptions (de contextos específicos como BR4)
  // ou se devemos usar os filtros do contexto global (Betano)
  const finalRenderOptions = {
    ...renderOptions,
    marketFilters: renderOptions.marketFilters || globalFilters.marketFilters
  };
  
  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => (
    <HeaderRow>
      <HeaderCell>Hora<br/>Minuto</HeaderCell>
      {minutes.map((minute, index) => (
        <MinuteCell key={`minute-${index}`}>{minute.value}</MinuteCell>
      ))}
      <HeaderCell>%</HeaderCell>
      <HeaderCell>Greens</HeaderCell>
      <HeaderCell>⚽️</HeaderCell>
    </HeaderRow>
  );
  
  // Função para renderizar o resultado de acordo com o filtro de tempo selecionado
  const renderScoreByTimeFilter = (match: IMatch) => {
    const ftHomeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const ftAwayScore = parseInt(match.FullTimeAwayTeam) || 0;
    const htHomeScore = parseInt(match.HalfTimeHomeTeam) || 0;
    const htAwayScore = parseInt(match.HalfTimeAwayTeam) || 0;
    
    switch (timeFilter) {
      case 'HT':
        return <Score>{`${htHomeScore}-${htAwayScore}`}</Score>;
      case 'HT+FT':
        return (
          <>
            <Score>{`${ftHomeScore}-${ftAwayScore}`}</Score>
            <HalfTimeScore>{`${htHomeScore}-${htAwayScore}`}</HalfTimeScore>
          </>
        );
      case 'FT':
      default:
        return <Score>{`${ftHomeScore}-${ftAwayScore}`}</Score>;
    }
  };
  
  // Renderiza as células com dados de jogos
  const renderCell = (hour: number, minuteStr: string, rowCells: TableCell[]) => {
    const minute = parseInt(minuteStr);
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    
    if (!cellData || cellData.matches.length === 0) {
      // Adicionar célula vazia para estatísticas
      rowCells.push({
        isEmpty: true,
        color: 'white'
      });
      
      return (
        <DataCell key={`cell-${minuteStr}`} {...getCellColor(undefined, undefined, finalRenderOptions, timeFilter)}>
          <Score>{'-'}</Score>
        </DataCell>
      );
    }
    
    // Pegar o primeiro jogo da célula (normalmente só há um por hora/minuto)
    const match = cellData.matches[0];
    
    // Determinar qual pontuação usar com base no filtro de tempo
    let homeScore = 0;
    let awayScore = 0;
    
    if (timeFilter === 'HT') {
      homeScore = parseInt(match.HalfTimeHomeTeam) || 0;
      awayScore = parseInt(match.HalfTimeAwayTeam) || 0;
    } else {
      homeScore = parseInt(match.FullTimeHomeTeam) || 0;
      awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    }
    
    const homeWin = isHomeWin(homeScore, awayScore);
    
    // Determinar a cor da célula com base na pontuação correta para o filtro de tempo
    // Aqui passamos o match completo para que a função getCellColor possa usar os dados corretos conforme o filtro
    const cellColor = getCellColor(homeWin, match, finalRenderOptions, timeFilter);
    
    // Adicionar célula para estatísticas
    rowCells.push({
      isEmpty: false,
      color: cellColor.color as CellColor,
      match
    });
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...cellColor}>
        {renderScoreByTimeFilter(match)}
      </DataCell>
    );
  };
  
  // Renderiza uma linha de dados com hora na vertical
  const renderDataRow = (hour: number) => {
    // Array para armazenar informações das células para estatísticas
    const rowCells: TableCell[] = [];
    
    // Renderizar todas as células da linha e coletar dados para estatísticas
    const renderedCells = minutes.map(minute => 
      renderCell(hour, minute.value, rowCells)
    );
    
    // Calcular estatísticas para esta linha
    const stats = calculateRowStats(rowCells);
    
    return (
      <DataRow key={`row-${hour}`}>
        <HourCell>{hour < 10 ? `0${hour}` : hour}</HourCell>
        {renderedCells}
        <SummaryCell>
          {stats.totalGoals > 0 || stats.totalGreenCells > 0 ? (
            <GreenPercentage isGreen={isGreenPercentage(stats.greenPercentage)}>
              {stats.greenPercentage}%
            </GreenPercentage>
          ) : '-'}
        </SummaryCell>
        <SummaryCell>{stats.totalGreenCells > 0 ? stats.totalGreenCells : '-'}</SummaryCell>
        <SummaryCell>{stats.totalGoals > 0 ? stats.totalGoals : '-'}</SummaryCell>
      </DataRow>
    );
  };

  return (
    <TableContainer>
      {customHeader}
      
      {loading && !isBackgroundRefreshing && matches.length === 0 ? (
        <LoadingMessage>
          <div>
            <span className="loading-text">Carregando dados...</span>
            <div className="loading-progress">
              <div className="loading-bar"></div>
            </div>
            <small>Aguarde alguns instantes. A tabela será exibida em breve.</small>
          </div>
        </LoadingMessage>
      ) : error ? (
        <LoadingMessage>
          <div>
            <span className="error-text">Erro ao carregar dados</span>
            <p>{error.message}</p>
            <button onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        </LoadingMessage>
      ) : (
        <>
          <Table>
            {renderMinutesHeader()}
            <tbody>
              {filteredHours.map(hour => renderDataRow(hour))}
            </tbody>
          </Table>
        </>
      )}
      
      {customFooter}
    </TableContainer>
  );
};

export default BaseLeagueTable;