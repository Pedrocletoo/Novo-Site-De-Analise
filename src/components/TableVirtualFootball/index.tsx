import React, { useRef, useEffect, useState } from 'react';
import { useFilterContext } from '../Filters';
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
  GreenPercentage
} from './styles';
import { CellColorProps, CellColor } from './types';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';
import { calculateRowStats, TableCell, isGreenPercentage } from '../../utils/tableStats';
import { useTimeFilter } from '../Filters/common/TimeFilter';
import BalanceBar from '../BalanceBar';
import { calculateAllColumnsStats } from '../../utils/columnStats';
import MinuteHeaderPercentage from './MinuteHeaderPercentage';
import { useResultSelection } from '../../hooks/useResultSelection';
import MatchResult from '../common/MatchResult';

/**
 * REGRAS IMPORTANTES:
 * 
 * 1. ESTRUTURA DA TABELA:
 *    - MINUTOS: Estão no cabeçalho horizontal (parte superior da tabela)
 *      Valores como 01, 04, 07, 10, 13, etc.
 * 
 *    - HORAS: Estão na coluna vertical (primeira coluna à esquerda)
 *      Valores como 22, 21, 20, 19, 18, etc. (em ordem decrescente)
 * 
 * 2. CORRESPONDÊNCIA DE JOGOS:
 *    - Os jogos SEMPRE começam EXATAMENTE nos minutos mostrados na tabela
 *    - Não existem jogos em minutos intermediários ou aproximados 
 *    - Cada jogo corresponde precisamente a uma célula específica na tabela
 *    - Exemplo: Um jogo às 15:43 aparece na linha 15, coluna 43
 * 
 * 3. QUALQUER ALTERAÇÃO DEVE MANTER ESTAS CONVENÇÕES
 */

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

// Interface para opções de renderização
interface RenderOptions {
  marketFilters?: {
    ambasMarcam?: { active: boolean, value: string },
    [key: string]: any
  };
  timeFilter?: string;
}

/**
 * Definição dos minutos no cabeçalho horizontal
 * IMPORTANTE: Os jogos SEMPRE começam exatamente nestes minutos específicos,
 * garantindo correspondência direta com as colunas da tabela.
 */
const minutes: IMinute[] = [
  { value: '01' }, { value: '04' }, { value: '07' }, { value: '10' },
  { value: '13' }, { value: '16' }, { value: '19' }, { value: '22' },
  { value: '25' }, { value: '28' }, { value: '31' }, { value: '34' },
  { value: '37' }, { value: '40' }, { value: '43' }, { value: '46' },
  { value: '49' }, { value: '52' }, { value: '55' }, { value: '58' }
];

// Função para obter a cor da célula com base no resultado
const getCellColor = (isHome: boolean | undefined, match?: IMatch, options?: RenderOptions): CellColorProps => {
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
  
  if (options?.timeFilter === 'HT') {
    homeScore = htHomeScore;
    awayScore = htAwayScore;
  } else {
    // Para FT ou HT+FT, usamos o resultado final para determinar as cores
    homeScore = ftHomeScore;
    awayScore = ftAwayScore;
  }
  
  const totalGols = homeScore + awayScore;
  const ambasMarcaram = homeScore > 0 && awayScore > 0;
  
  // Verificar se o filtro "Ambas Marcam" está ativo
  const ambasMarcamFilter = options?.marketFilters?.ambasMarcam;
  if (ambasMarcamFilter && ambasMarcamFilter.active) {
    const ambasMarcamValue = ambasMarcamFilter.value;
    if (ambasMarcamValue === 'sim') {
      // Quando o filtro "Ambas Marcam - Sim" está ativo
      return { color: ambasMarcaram ? 'green' : 'red' };
    } else if (ambasMarcamValue === 'nao') {
      // Quando o filtro "Ambas Marcam - Não" está ativo (lógica inversa)
      return { color: !ambasMarcaram ? 'green' : 'red' };
    }
  }
  
  // Verificar se o filtro "Viradinha" está ativo
  const viradinhaFilter = options?.marketFilters?.viradinha;
  if (viradinhaFilter && viradinhaFilter.active) {
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
  
  // Definição visual padrão da célula
  // Neste exemplo, consideramos o placar para definir a cor
  // Isso pode vir de qualquer regra externa ou configuração
  const isEven = (homeScore + awayScore) % 2 === 0;
  return { color: isEven ? 'red' : 'green' };
};

/**
 * Componente de Tabela de Futebol Virtual
 * Exibe dados de jogos em uma tabela formatada
 * 
 * A tabela é organizada por horas (linhas) e minutos (colunas)
 * Os jogos SEMPRE correspondem exatamente às combinações hora:minuto disponíveis
 */
const TableVirtualFootball: React.FC = () => {
  // Obter configurações de filtro
  const { hoursFilter, liga, marketFilters } = useFilterContext();
  
  // Obter o filtro de tempo atual
  const { timeFilter } = useTimeFilter();
  
  // Acessar o hook personalizado de seleção de resultados
  const { formatResult, selectResult, getStyleFromScores } = useResultSelection();
  
  // Buscar dados da API
  const { matches, lastUpdated } = useMatchData(liga || 'euro', '480');
  
  // Determinar quais horas mostrar baseado no filtro (em ordem decrescente)
  const currentHour = new Date().getHours();
  
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
    // Por exemplo: hora atual 15, ordem: 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 23, 22, 21, 20, 19, 18, 17, 16
    
    // Horas menores que a atual (em ordem decrescente)
    const hoursBelowCurrent = sortedHours
      .filter(h => h < currentHour)
      .sort((a, b) => b - a);
    
    // Horas maiores que a atual (em ordem decrescente)
    const hoursAboveCurrent = sortedHours
      .filter(h => h > currentHour)
      .sort((a, b) => b - a);
    
    // Retornar com a hora atual como primeira, seguida das outras horas em ordem decrescente
    // a partir da hora atual
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
  
  // Processar os dados da tabela usando o hook useTimeTable
  // Configurado para modo normal (não teste) e usando as horas filtradas
  const { cells } = useTimeTable(
    matches,
    hoursFilter, 
    minutes,
    true, // testMode como quarto parâmetro
    undefined, // testHour como quinto parâmetro
    filteredHours // selectedHours como sexto parâmetro
  );
  
  // Adicionar um log quando os dados da tabela são atualizados
  React.useEffect(() => {
    if (matches && matches.length > 0) {
      console.log(`🔄 [TableVirtualFootball] Dados atualizados para ${liga}:`, {
        totalMatches: matches.length,
        lastUpdate: lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'
      });
    }
  }, [matches, lastUpdated, liga]);
  
  // Opções de renderização
  const renderOptions = { 
    marketFilters,
    timeFilter
  };

  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => {
    // Calcular estatísticas para todas as colunas (minutos)
    const columnsStats = calculateAllColumnsStats(
      cells, 
      minutes, 
      filteredHours, 
      { marketFilters, timeFilter }
    );
    
    return (
      <>
        <MinuteHeaderPercentage columnsStats={columnsStats} />
        <HeaderRow>
          <HeaderCell>Hora<br/>Minuto</HeaderCell>
          {minutes.map((minute, index) => (
            <MinuteCell key={`minute-${index}`}>{minute.value}</MinuteCell>
          ))}
          <HeaderCell>%</HeaderCell>
          <HeaderCell>Greens</HeaderCell>
          <HeaderCell>⚽️</HeaderCell>
        </HeaderRow>
      </>
    );
  };

  // Função para lidar com clique em uma célula
  const handleCellClick = (homeScore: number, awayScore: number) => {
    const result = formatResult(homeScore, awayScore);
    selectResult(result);
  };

  // Renderiza uma linha de dados com hora na vertical
  const renderDataRow = (hour: number) => {
    // Array para armazenar informações de cada célula para cálculo de estatísticas
    const rowCells: TableCell[] = [];
    
    // Renderizar as células de dados (minutos) e coletar informações para estatísticas
    const renderedCells = minutes.map(minute => {
      const minuteValue = parseInt(minute.value);
      const cellKey = `${hour}:${minuteValue}`;
      const cellData = cells[cellKey];
      
      // Se não houver jogos para esta célula, mostrar traço
      if (!cellData || cellData.matches.length === 0) {
        // Adicionar célula vazia ao array para estatísticas
        rowCells.push({
          isEmpty: true,
          color: 'white'
        });
        
        return (
          <DataCell key={`cell-${minute.value}`} color="white">
            <Score>{'-'}</Score>
          </DataCell>
        );
      }
      
      // Pegar o primeiro jogo da célula
      const match = cellData.matches[0];
      
      // Determinar quais scores usar para estatísticas e coloração
      let homeScore = 0;
      let awayScore = 0;
      
      if (timeFilter === 'HT') {
        homeScore = parseInt(match.HalfTimeHomeTeam) || 0;
        awayScore = parseInt(match.HalfTimeAwayTeam) || 0;
      } else {
        homeScore = parseInt(match.FullTimeHomeTeam) || 0;
        awayScore = parseInt(match.FullTimeAwayTeam) || 0;
      }
      
      // Determinar a cor da célula
      const cellColor = getCellColor(undefined, match, renderOptions);
      
      // Obter estilos para o resultado selecionado
      const style = getStyleFromScores(homeScore, awayScore);
      
      // Adicionar célula ao array para estatísticas
      rowCells.push({
        isEmpty: false,
        color: cellColor.color as CellColor,
        match
      });
      
      return (
        <DataCell 
          key={`cell-${minute.value}`} 
          {...cellColor}
          style={{
            cursor: style.cursor,
            backgroundColor: style.backgroundColor
          }}
        >
          <div onClick={() => handleCellClick(homeScore, awayScore)}>
            <MatchResult 
              match={match} 
              timeFilter={timeFilter}
              onClick={() => handleCellClick(homeScore, awayScore)}
            />
          </div>
        </DataCell>
      );
    });
    
    // Calcular estatísticas desta linha
    const stats = calculateRowStats(rowCells);
    
    return (
      <DataRow key={`row-${hour}`}>
        <HourCell>{hour}</HourCell>
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
    
    // Percorrer todas as horas e calcular o total
    filteredHours.forEach(hour => {
      const rowCells: TableCell[] = [];
      
      // Coletar informações de todas as células da hora
      minutes.forEach(minute => {
        const minuteValue = parseInt(minute.value);
        const cellKey = `${hour}:${minuteValue}`;
        const cellData = cells[cellKey];
        
        if (!cellData || cellData.matches.length === 0) {
          rowCells.push({
            isEmpty: true,
            color: 'white'
          });
          return;
        }
        
        // Pegar o primeiro jogo da célula
        const match = cellData.matches[0];
        
        // Determinar scores
        let homeScore = 0;
        let awayScore = 0;
        
        if (timeFilter === 'HT') {
          homeScore = parseInt(match.HalfTimeHomeTeam) || 0;
          awayScore = parseInt(match.HalfTimeAwayTeam) || 0;
        } else {
          homeScore = parseInt(match.FullTimeHomeTeam) || 0;
          awayScore = parseInt(match.FullTimeAwayTeam) || 0;
        }
        
        // Determinar a cor da célula
        const cellColor = getCellColor(undefined, match, renderOptions);
        
        rowCells.push({
          isEmpty: false,
          color: cellColor.color as CellColor,
          match
        });
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
  
  // Renderizar a tabela completa
  return (
    <>
      <BalanceBar 
        greenPercentage={totalStats.greenPercentage} 
        redPercentage={totalStats.redPercentage} 
      />
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

export default TableVirtualFootball;