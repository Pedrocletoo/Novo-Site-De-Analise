import React, { useRef, useEffect, useState } from 'react';
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
  LoadingMessage,
  OddValue
} from '../../TableVirtualFootball/styles';
import { CellColorProps, CellColor } from '../../TableVirtualFootball/types';
import { IMatch } from '../../../services/api';
import { useFilterContext } from '../../Filters';
import { MarketFilterState, MarketFilterType } from '../../Filters/types';
import { calculateRowStats, TableCell, isGreenPercentage } from '../../../utils/tableStats';
import { useTimeFilter, TimeFilterOption } from '../../Filters/common/TimeFilter';
import BalanceBar from '../../BalanceBar';
import { calculateAllColumnsStats } from '../../../utils/columnStats';
import MinuteHeaderPercentage from '../../TableVirtualFootball/MinuteHeaderPercentage';
import { useHorasPagantes } from '../../../contexts/HorasPagantesContext';
import TendenciaIndicator from '../../Tendencia/TendenciaIndicator';
import { useSelectedResults } from '../../../contexts/SelectedResultsContext';
import { useResultSelection } from '../../../hooks/useResultSelection';
import MatchResult from '../../common/MatchResult';

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
  activeMarketFilter?: MarketFilterType | null;
  isBR4?: boolean;
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
 * Função para obter o valor da odd com base no filtro de mercado selecionado
 */
const getOddValue = (
  match: IMatch,
  marketFilter: MarketFilterType,
  marketValue: string,
  isBR4?: boolean
): number | null => {
  if (!match || !match.Markets || match.Markets.length === 0) {
    return null;
  }

  // Verificar valores específicos que sabemos que não existem na API da Betano
  // Apenas aplicar para Betano, não para BR4
  if (!isBR4) {
    if (marketFilter === 'over' && (marketValue === '4.5' || marketValue === '5.5')) {
      return null;
    }
    
    if (marketFilter === 'under' && marketValue === '4.5') {
      return null;
    }
  }

  let marketName = '';
  let selectionName = '';

  // Mapear o tipo de filtro para o nome do mercado na API
  switch (marketFilter) {
    case 'ambasMarcam':
      marketName = 'Ambas equipes Marcam';
      selectionName = marketValue === 'sim' ? 'Sim' : 'Não';
      break;
    case 'over':
      marketName = 'Total de Gols Mais/Menos';
      // Na BR4, os decimais são representados com vírgula em vez de ponto
      selectionName = isBR4 ? 
        `Mais de ${marketValue.replace('.', ',')}` : 
        `Mais de ${marketValue}`;
      break;
    case 'under':
      marketName = 'Total de Gols Mais/Menos';
      // Na BR4, os decimais são representados com vírgula em vez de ponto
      selectionName = isBR4 ? 
        `Menos de ${marketValue.replace('.', ',')}` : 
        `Menos de ${marketValue}`;
      break;
    case 'totalGols':
      marketName = 'Total de gols';
      selectionName = marketValue;
      break;
    case 'viradinha':
      // Não há um mercado direto para viradinha, retornar null
      return null;
    default:
      return null;
  }

  // Para over/under, verificar primeiro o mercado alternativo que é mais completo
  if (marketFilter === 'over' || marketFilter === 'under') {
    // Verificar primeiro mercado alternativo (que geralmente contém mais opções)
    const altMarket = match.Markets.find(m => m.Name === 'Total de Gols Mais/Menos (alternativas)');
    if (altMarket) {
      const selection = altMarket.Selections.find(s => s.Name === selectionName);
      if (selection) {
        return selection.Price;
      }
    }
    
    // Se não encontrou no alternativo, tenta no mercado padrão
    const market = match.Markets.find(m => m.Name === marketName);
    if (market) {
      const selection = market.Selections.find(s => s.Name === selectionName);
      if (selection) {
        return selection.Price;
      }
    }
    
    // Para Betano (não BR4), não procuramos seleções similares para 
    // over/under 4.5 ou over 5.5 que sabemos que não existem
    if (!isBR4 && (
        (marketFilter === 'over' && (marketValue === '4.5' || marketValue === '5.5')) || 
        (marketFilter === 'under' && marketValue === '4.5')
    )) {
      return null;
    }
    
    // Na BR4, se chegamos aqui, significa que a odds não existe nesse mercado
    if (isBR4) {
      return null;
    }
    
    // Se não encontrou em nenhum dos dois, tenta procurar um valor similar
    // (Apenas para Betano, não BR4)
    if (!isBR4 && altMarket) {
      // Procurar por qualquer seleção que contenha a string base (ex: "Mais de")
      const baseSelectionName = selectionName.split(' ').slice(0, -1).join(' ');
      const similarSelections = altMarket.Selections.filter(s => 
        s.Name.startsWith(baseSelectionName)
      );
      
      if (similarSelections.length > 0) {
        // Retornar a primeira seleção similar encontrada
        return similarSelections[0].Price;
      }
    }
    
    return null;
  }
  
  // Para outros mercados, manter a lógica original
  const market = match.Markets.find(m => m.Name === marketName);
  if (!market) {
    return null;
  }

  // Encontrar a seleção pelo nome
  const selection = market.Selections.find(s => s.Name === selectionName);
  return selection ? selection.Price : null;
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
  // Obter o estado de filtro de tempo
  const { timeFilter } = useTimeFilter();
  
  // Obter os filtros de mercado ativos
  const { marketFilters, activeMarketFilter: contextActiveMarketFilter } = useFilterContext();
  
  // Estado para controlar o toggle de horas pagantes
  const { horasPagantesAtivo, setHorasPagantesAtivo } = useHorasPagantes();

  // Usar o hook de seleção de resultados
  const { formatResult, selectResult, getStyleFromScores } = useResultSelection();

  // Combinar as opções de renderização do componente com o contexto global
  const finalRenderOptions: IMatchRenderOptions = {
    ...renderOptions,
    marketFilters: renderOptions.marketFilters || marketFilters,
    // Usar o activeMarketFilter fornecido nas renderOptions se existir, senão usar o do contexto
    activeMarketFilter: renderOptions.activeMarketFilter !== undefined ? 
      renderOptions.activeMarketFilter : 
      contextActiveMarketFilter
  };

  // Função para selecionar/desmarcar resultados
  const handleCellResultClick = (homeScore: number, awayScore: number) => {
    const result = formatResult(homeScore, awayScore);
    selectResult(result);
  };

  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => {
    // Calcular estatísticas para todas as colunas (minutos)
    const columnsStats = calculateAllColumnsStats(
      cells, 
      minutes, 
      filteredHours, 
      { marketFilters: finalRenderOptions.marketFilters, timeFilter }
    );
    
    // Identificar colunas pagantes (sequência de 3 ou mais com 50% ou mais)
    const colunasPagantes = identificarColunasPagantes(columnsStats);
    
    return (
      <>
        <MinuteHeaderPercentage columnsStats={columnsStats} />
        <HeaderRow>
          <HeaderCell>Hora<br/>Minuto</HeaderCell>
          {minutes.map((minute, index) => (
            <MinuteCell 
              key={`minute-${index}`}
              style={horasPagantesAtivo ? { 
                opacity: colunasPagantes.includes(index) ? 1 : 0.4,
                fontWeight: colunasPagantes.includes(index) ? 'bold' : 'normal'
              } : {}}
            >
              {minute.value}
            </MinuteCell>
          ))}
          <HeaderCell>%</HeaderCell>
          <HeaderCell>Greens</HeaderCell>
          <HeaderCell>⚽️</HeaderCell>
        </HeaderRow>
      </>
    );
  };
  
  // Função para identificar colunas pagantes (sequência de 3 ou mais com 50% ou mais)
  const identificarColunasPagantes = (columnsStats: any[]) => {
    const colunasPagantes: number[] = [];
    let sequenciaAtual: number[] = [];
    
    // Percorrer todas as colunas e verificar as que têm 50% ou mais
    columnsStats.forEach((stat, index) => {
      if (stat.greenPercentage >= 50) {
        sequenciaAtual.push(index);
      } else {
        // Verificar se a sequência terminada tem 3 ou mais colunas
        if (sequenciaAtual.length >= 3) {
          colunasPagantes.push(...sequenciaAtual);
        }
        sequenciaAtual = [];
      }
    });
    
    // Verificar a última sequência
    if (sequenciaAtual.length >= 3) {
      colunasPagantes.push(...sequenciaAtual);
    }
    
    return colunasPagantes;
  };
  
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
  const renderCell = (hour: number, minuteStr: string, rowCells: TableCell[], columnsStats: any[]) => {
    const minute = parseInt(minuteStr);
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    
    // Identificar se esta é uma coluna pagante
    const colunasPagantes = identificarColunasPagantes(columnsStats);
    const minuteIndex = minutes.findIndex(m => m.value === minuteStr);
    const isColunaPagante = colunasPagantes.includes(minuteIndex);
    
    if (!cellData || cellData.matches.length === 0) {
      // Adicionar célula vazia para estatísticas
      rowCells.push({
        isEmpty: true,
        color: 'white'
      });
      
      return (
        <DataCell 
          key={`cell-${minuteStr}`} 
          {...getCellColor(undefined, undefined, finalRenderOptions, timeFilter)}
          style={horasPagantesAtivo ? { 
            opacity: isColunaPagante ? 1 : 0.4
          } : {}}
        >
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
    const cellColor = getCellColor(homeWin, match, finalRenderOptions, timeFilter);
    
    // Obter estilo do resultado selecionado
    const resultStyle = getStyleFromScores(homeScore, awayScore);
    
    // Verificar se a seleção veio do dropdown de Odds
    // Só mostrar odds se o activeMarketFilter for não-nulo
    const shouldShowOdds = finalRenderOptions.activeMarketFilter !== null;
    
    // Obter odd apenas se devemos mostrar odds
    let oddValue: number | null = null;
    let isUnsupportedMarket = false;

    if (finalRenderOptions.marketFilters && shouldShowOdds && finalRenderOptions.activeMarketFilter) {
      const activeFilter = finalRenderOptions.marketFilters[finalRenderOptions.activeMarketFilter];
      if (activeFilter && activeFilter.active) {
        // Verificar se é um dos mercados que não existem na API
        if ((activeFilter.type === 'over' && (activeFilter.value === '4.5' || activeFilter.value === '5.5')) || 
            (activeFilter.type === 'under' && (activeFilter.value === '4.5' || activeFilter.value === '5.5'))) {
          isUnsupportedMarket = true;
        } else {
          // Obter valor da odd do match
          oddValue = getOddValue(
            match, 
            activeFilter.type,
            activeFilter.value,
            finalRenderOptions.isBR4
          );
        }
      }
    }
    
    // Adicionar célula ao array para estatísticas
    rowCells.push({
      isEmpty: false,
      color: cellColor.color as CellColor,
      match
    });
    
    return (
      <DataCell 
        key={`cell-${minuteStr}`} 
        {...cellColor}
        onClick={() => handleCellResultClick(homeScore, awayScore)}
        style={{
          cursor: 'pointer',
          opacity: horasPagantesAtivo ? (isColunaPagante ? 1 : 0.4) : 1,
          backgroundColor: resultStyle.backgroundColor
        }}
      >
        <div style={{ color: resultStyle.textColor, fontWeight: resultStyle.fontWeight }}>
          <MatchResult 
            match={match}
            timeFilter={timeFilter}
            onClick={() => handleCellResultClick(homeScore, awayScore)}
          />
          {shouldShowOdds && (
            <OddValue isUnsupported={isUnsupportedMarket} style={{ color: resultStyle.textColor }}>
              {isUnsupportedMarket ? 'N/A' : oddValue ? oddValue.toFixed(2) : '-'}
            </OddValue>
          )}
        </div>
      </DataCell>
    );
  };
  
  // Renderiza uma linha de dados com hora na vertical
  const renderDataRow = (hour: number) => {
    // Array para armazenar informações das células para estatísticas
    const rowCells: TableCell[] = [];
    
    // Calcular estatísticas para todas as colunas (minutos)
    const columnsStats = calculateAllColumnsStats(
      cells, 
      minutes, 
      filteredHours, 
      { marketFilters: finalRenderOptions.marketFilters, timeFilter }
    );
    
    // Renderizar todas as células da linha e coletar dados para estatísticas
    const renderedCells = minutes.map(minute => 
      renderCell(hour, minute.value, rowCells, columnsStats)
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

  // Calcular as estatísticas totais para a barra de equilíbrio
  const calculateTotalStats = () => {
    let totalGreenCells = 0;
    let totalRedCells = 0;
    
    // Calcular estatísticas para todas as colunas (minutos)
    const columnsStats = calculateAllColumnsStats(
      cells, 
      minutes, 
      filteredHours, 
      { marketFilters: finalRenderOptions.marketFilters, timeFilter }
    );
    
    // Percorrer todas as horas e calcular o total
    filteredHours.forEach(hour => {
      const rowCells: TableCell[] = [];
      
      // Coletar informações de todas as células da hora
      minutes.forEach(minute => {
        // Chamar a função renderCell que já foi definida no componente para obter os dados da célula
        // mas como não queremos o elemento JSX, apenas coletamos os dados
        renderCell(hour, minute.value, rowCells, columnsStats);
      });
      
      // Contar células verdes e vermelhas
      rowCells.forEach(cell => {
        if (!cell.isEmpty) {
          if (cell.color === 'green') {
            totalGreenCells++;
          } else if (cell.color === 'red') {
            totalRedCells++;
          }
        }
      });
    });
    
    const totalColoredCells = totalGreenCells + totalRedCells;
    
    // Calcular porcentagens (evitando divisão por zero)
    const greenPercentage = totalColoredCells > 0 
      ? (totalGreenCells / totalColoredCells) * 100 
      : 0;
    
    const redPercentage = totalColoredCells > 0 
      ? (totalRedCells / totalColoredCells) * 100 
      : 0;
    
    return {
      greenPercentage,
      redPercentage
    };
  };
  
  // Calcular estatísticas para a barra de equilíbrio
  const totalStats = calculateTotalStats();

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
    <>
      <BalanceBar 
        greenPercentage={totalStats.greenPercentage} 
        redPercentage={totalStats.redPercentage} 
      />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Horas Pagantes:</span>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={horasPagantesAtivo}
            onChange={() => setHorasPagantesAtivo(!horasPagantesAtivo)}
          />
          <span className="toggle-slider"></span>
        </label>
        <TendenciaIndicator 
          filteredHours={filteredHours}
          matches={matches}
          minutes={minutes}
          cells={cells}
          timeFilter={timeFilter}
          renderOptions={finalRenderOptions}
        />
        <style>{`
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
          }
          
          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
          }
          
          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          input:checked + .toggle-slider {
            background-color: var(--accent-color, #4CAF50);
          }
          
          input:checked + .toggle-slider:before {
            transform: translateX(26px);
          }
        `}</style>
      </div>
      
      <TableContainer>
        <Table>
          {renderMinutesHeader()}
          <tbody>
            {filteredHours.map(hour => renderDataRow(hour))}
          </tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BaseLeagueTable;