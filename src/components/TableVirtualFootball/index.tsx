import React, { useRef, useEffect } from 'react';
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
  GreenPercentage,
  LoadingMessage
} from './styles';
import { CellColorProps } from './types';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';

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

// Função para determinar se um placar representa vitória do mandante
const isHomeWin = (homeScore: number, awayScore: number): boolean | undefined => {
  if (homeScore === 0 && awayScore === 0) return undefined; // Sem dados
  return homeScore > awayScore;
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
  const { hoursFilter, liga, marketFilters, activeMarketFilter } = useFilterContext();
  
  // Estado para controlar contador de atualizações
  const [updateCount, setUpdateCount] = React.useState(0);
  const lastUpdatedTimeRef = useRef<Date | null>(null);
  
  // Buscar dados da API
  const { matches, loading, error, lastUpdated, isBackgroundRefreshing } = useMatchData(liga || 'euro', '480');
  
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
  
  // Opções de renderização
  const renderOptions = { 
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
      <HeaderCell>Σ</HeaderCell>
    </HeaderRow>
  );

  // Renderiza as células com dados de jogos
  const renderCell = (hour: number, minuteStr: string) => {
    const minute = parseInt(minuteStr);
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    
    // Se não houver jogos para esta célula, mostrar traço
    if (!cellData || cellData.matches.length === 0) {
      return (
        <DataCell key={`cell-${minuteStr}`} {...getCellColor(undefined, undefined, renderOptions)}>
          <Score>{'-'}</Score>
        </DataCell>
      );
    }
    
    // Pegar o primeiro jogo da célula
    const match = cellData.matches[0];
    const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    const homeWin = homeScore > awayScore;
    
    return (
      <DataCell key={`cell-${minuteStr}`} {...getCellColor(homeWin, match, renderOptions)}>
        <Score>{`${homeScore}-${awayScore}`}</Score>
      </DataCell>
    );
  };

  // Renderiza uma linha de dados com hora na vertical
  const renderDataRow = (hour: number) => {
    const stats = hourStats[hour];
    const winPercentage = stats.total > 0 
      ? Math.round((stats.wins / stats.total) * 100) 
      : 0;
    
    return (
      <DataRow key={`row-${hour}`}>
        <HourCell>{hour}</HourCell>
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
            <div>Carregando dados dos jogos...</div>
          </div>
        </LoadingMessage>
      </TableContainer>
    );
  }
  
  // Exibir mensagem de erro, se houver
  if (error && matches.length === 0) {
    return (
      <TableContainer>
        <LoadingMessage>Erro ao carregar dados: {error.message}</LoadingMessage>
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

export default TableVirtualFootball;