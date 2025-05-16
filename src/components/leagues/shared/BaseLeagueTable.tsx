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
  GreenPercentage,
  LoadingMessage
} from '../../TableVirtualFootball/styles';
import { CellColorProps, CellColor } from '../../TableVirtualFootball/types';
import { IMatch } from '../../../services/api';
import { useFilterContext } from '../../Filters';
import { MarketFilterState, MarketFilterType } from '../../Filters/types';
import { calculateRowStats, TableCell, isGreenPercentage } from '../../../utils/tableStats';

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
 * e no filtro "ambas marcam" quando ativado
 */
export const getCellColor = (
  isHome: boolean | null | undefined, 
  match?: IMatch,
  options?: IMatchRenderOptions
): CellColorProps => {
  // Se não houver partida, retornar branco
  if (!match) {
    return { color: 'white' };
  }
  
  // Obter os pontos
  const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
  const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
  
  // Verificar se ambos os times marcaram
  const ambasMarcaram = homeScore > 0 && awayScore > 0;
  
  // Filtro "Ambas Marcam"
  if (options?.marketFilters?.ambasMarcam?.active) {
    // Verificar qual valor está selecionado (sim ou não)
    const ambasMarcamValue = options.marketFilters.ambasMarcam.value;
    
    if (ambasMarcamValue === 'sim') {
      // Quando o filtro "Ambas Marcam - Sim" está ativo
      return { color: ambasMarcaram ? 'green' : 'red' };
    } else if (ambasMarcamValue === 'nao') {
      // Quando o filtro "Ambas Marcam - Não" está ativo (lógica inversa)
      return { color: !ambasMarcaram ? 'green' : 'red' };
    }
  }
  
  // Se o filtro não estiver ativo, manter cor branca conforme solicitado anteriormente
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
  // Obter o filtro de "ambas marcam" do contexto
  const { marketFilters } = useFilterContext();
  
  // Adicionar o filtro de ambasMarcam às opções de renderização
  const combinedRenderOptions = {
    ...renderOptions,
    marketFilters
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
        <DataCell key={`cell-${minuteStr}`} {...getCellColor(undefined, undefined, combinedRenderOptions)}>
          <Score>{'-'}</Score>
        </DataCell>
      );
    }
    
    // Pegar o primeiro jogo da célula (normalmente só há um por hora/minuto)
    const match = cellData.matches[0];
    const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    const homeWin = isHomeWin(homeScore, awayScore);
    
    // Determinar a cor da célula
    const cellColor = getCellColor(homeWin, match, combinedRenderOptions);
    
    // Adicionar célula para estatísticas
    rowCells.push({
      isEmpty: false,
      color: cellColor.color as CellColor,
      match
    });
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...cellColor}>
        <Score>{`${homeScore}-${awayScore}`}</Score>
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