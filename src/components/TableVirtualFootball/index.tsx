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
  GreenPercentage
} from './styles';
import { CellColorProps, CellColor } from './types';
import { useMatchData } from '../../hooks';
import { useTimeTable } from '../../hooks/useTimeTable';
import { IMatch } from '../../services/api';
import { calculateRowStats, TableCell, isGreenPercentage } from '../../utils/tableStats';

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
      const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
      const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
      
      // Determinar a cor da célula
      const cellColor = getCellColor(undefined, match, renderOptions);
      
      // Adicionar célula ao array para estatísticas
      rowCells.push({
        isEmpty: false,
        color: cellColor.color as CellColor,
        match
      });
      
      return (
        <DataCell key={`cell-${minute.value}`} {...cellColor}>
          <Score>{`${homeScore}-${awayScore}`}</Score>
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

  // Renderizar a tabela completa sempre, sem mostrar tela de carregamento
  // Mesmo que não tenhamos dados ainda, isso garantirá uma experiência instantânea
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