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
import { CellColorProps } from '../../TableVirtualFootball/types';
import { IMatch } from '../../../services/api';
import { useFilterContext, MarketFilterState, MarketFilterType } from '../../Filters';

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
  if (options?.marketFilters?.ambasMarcam?.active && options.marketFilters.ambasMarcam.value === 'sim') {
    // Quando o filtro "Ambas Marcam - Sim" está ativo
    return { color: ambasMarcaram ? 'green' : 'red' };
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
  minutes,
  filteredHours,
  cells,
  hourStats,
  renderOptions = {},
  customHeader,
  customFooter
}) => {
  // Estado para exibir indicador de atualização recente
  const [showUpdateIndicator, setShowUpdateIndicator] = React.useState(false);
  
  // Referência para rastrear o último horário de atualização
  const lastUpdatedRef = React.useRef<Date | null>(null);
  
  // Obter o filtro de "ambas marcam" do contexto
  const { marketFilters } = useFilterContext();
  
  // Adicionar o filtro de ambasMarcam às opções de renderização
  const combinedRenderOptions = {
    ...renderOptions,
    marketFilters
  };
  
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
  
  // Preparar estatísticas por hora, se não fornecidas
  const calculatedHourStats = React.useMemo(() => {
    // Valor inicial
    const stats: Record<number, { total: number; wins: number }> = {};
    
    // Inicializar estatísticas para todas as horas filtradas
    filteredHours.forEach(hour => {
      stats[hour] = { total: 0, wins: 0 };
    });
    
    // Se hourStats já foi fornecido, retorna ele diretamente
    if (hourStats) {
      return hourStats;
    }
    
    // Calcular estatísticas a partir das células
    Object.keys(cells).forEach(cellKey => {
      const [hourStr] = cellKey.split(':');
      const hour = parseInt(hourStr);
      
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
  }, [cells, filteredHours, hourStats]);
  
  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => (
    <HeaderRow>
      <HeaderCell>Hora<br/>Minuto</HeaderCell>
      {minutes.map((minute, index) => (
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
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...getCellColor(homeWin, match, combinedRenderOptions)}>
        <Score>{`${homeScore}-${awayScore}`}</Score>
      </DataCell>
    );
  };
  
  // Renderiza uma linha de dados com hora na vertical
  const renderDataRow = (hour: number) => {
    const stats = calculatedHourStats[hour];
    const winPercentage = stats.total > 0 
      ? Math.round((stats.wins / stats.total) * 100) 
      : 0;
    
    return (
      <DataRow key={`row-${hour}`}>
        <HourCell>{hour < 10 ? `0${hour}` : hour}</HourCell>
        {minutes.map(minute => renderCell(hour, minute.value))}
        <SummaryCell>
          {stats.total > 0 ? (
            <GreenPercentage isGreen={winPercentage >= 50}>
              {winPercentage}%
            </GreenPercentage>
          ) : '-'}
        </SummaryCell>
        <SummaryCell>{stats.wins || '-'}</SummaryCell>
        <SummaryCell>{stats.total || '-'}</SummaryCell>
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
      {customHeader}
      
      <TableContainer>
        <Table>
          {renderMinutesHeader()}
          <tbody>
            {filteredHours.map(hour => renderDataRow(hour))}
          </tbody>
        </Table>
      </TableContainer>
      
      {customFooter}
    </TableContainer>
  );
};

export default BaseLeagueTable; 