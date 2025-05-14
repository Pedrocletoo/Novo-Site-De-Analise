import React from 'react';
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
 * Componente de Tabela de Futebol Virtual
 * Exibe dados de jogos em uma tabela formatada
 * 
 * A tabela é organizada por horas (linhas) e minutos (colunas)
 * Os jogos SEMPRE correspondem exatamente às combinações hora:minuto disponíveis
 */
const TableVirtualFootball: React.FC = () => {
  // Obter configurações de filtro
  const { hoursFilter, liga } = useFilterContext();
  
  // Buscar dados da API
  const { matches, loading, error } = useMatchData(liga || 'euro', '480');
  
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
    
    // Separar as outras horas nas duas faixas
    const hoursBelow18 = sortedHours.filter(h => h <= 17).sort((a, b) => b - a);
    const hoursAbove17 = sortedHours.filter(h => h > 17).sort((a, b) => b - a);
    
    // Retornar com a hora atual como primeira, seguida das outras horas na ordem correta
    // Primeiro a hora atual, depois 0-17 decrescente, depois 18-23 decrescente
    return [currentHour, ...hoursBelow18, ...hoursAbove17];
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
    
    // Aplicar a mesma ordenação usada no componente TesteTabela,
    // colocando horas 0-17 primeiro em ordem decrescente, e depois 18-23 em ordem decrescente
    return sortHoursInCorrectOrder(hours);
  }, [currentHour, hoursFilter]);
  
  // Processar os dados da tabela usando o hook useTimeTable
  // Configurado para modo normal (não teste) e usando as horas filtradas
  const { cells } = useTimeTable(matches, true, undefined, filteredHours);
  
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

  // Exibir mensagem de carregamento se necessário
  if (loading) {
    return (
      <TableContainer>
        <LoadingMessage>Carregando dados de jogos...</LoadingMessage>
      </TableContainer>
    );
  }

  // Exibir mensagem de erro se necessário
  if (error) {
    return (
      <TableContainer>
        <LoadingMessage isError>
          Erro ao carregar dados: {error.message}
        </LoadingMessage>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        {renderMinutesHeader()}
        {filteredHours.map(hour => renderDataRow(hour))}
      </Table>
    </TableContainer>
  );
};

export default TableVirtualFootball;