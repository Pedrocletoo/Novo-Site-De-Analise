import { useMemo } from 'react';
import { IMatch } from '../services/api';

// Estrutura para a célula da tabela
export interface ITimeCell {
  hour: number;
  minute: number;
  matches: IMatch[];
}

// Estrutura da tabela de tempo
export interface ITimeTable {
  hours: number[];
  minuteBlocks: number[];
  cells: Record<string, ITimeCell>;
}

/**
 * IMPORTANTE: Os minutos dos jogos SEMPRE correspondem exatamente aos minutos definidos abaixo.
 * Não existem jogos em minutos intermediários ou aproximados.
 * Cada jogo começa exatamente em um dos minutos listados abaixo, garantindo
 * correspondência direta com as colunas da tabela.
 */
const FIXED_MINUTE_BLOCKS = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58];

/**
 * Verifica se uma partida está finalizada e tem dados válidos
 * 
 * @param match - Objeto da partida
 * @returns Verdadeiro se a partida estiver finalizada e com dados válidos
 */
function isFinishedMatch(match: IMatch): boolean {
  // Verificar se a partida tem dados de placar
  const hasFullTimeData = 
    match.FullTimeHomeTeam !== undefined && 
    match.FullTimeHomeTeam !== null &&
    match.FullTimeAwayTeam !== undefined && 
    match.FullTimeAwayTeam !== null;
  
  // Verificar se a data de início é válida
  const hasValidStartTime = Boolean(match.StartTime);
  
  // Verificar se a partida já aconteceu (não é um jogo futuro)
  const matchDate = new Date(match.StartTime);
  const now = new Date();
  const isPastMatch = matchDate < now;
  
  // Uma partida finalizada precisa ter placar, data válida e já ter acontecido
  return hasFullTimeData && hasValidStartTime && isPastMatch;
}

/**
 * Extrai a hora e o minuto de um horário e verifica se o minuto é válido
 * conforme os blocos de minutos fixos da tabela
 * 
 * REGRA CRÍTICA: Os jogos SEMPRE começam exatamente nos minutos específicos definidos em FIXED_MINUTE_BLOCKS.
 * Qualquer jogo cujo minuto não esteja exatamente nessa lista deve ser considerado inválido
 * e não deve ser posicionado na tabela.
 * 
 * @param startTime - String com o horário de início no formato ISO
 * @param customMinuteBlocks - Array de minutos personalizados (opcional)
 * @returns Objeto com hora, minuto e flag indicando se o minuto está nas colunas da tabela
 */
function extractTimeInfo(
  startTime: string,
  customMinuteBlocks: number[] = FIXED_MINUTE_BLOCKS
): { hour: number; minute: number; isValidMinute: boolean } {
  try {
    const date = new Date(startTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Verificar explicitamente se o minuto extraído corresponde exatamente a um dos minutos da tabela
    // Isso é CRUCIAL para o correto posicionamento dos jogos na tabela
    const isValidMinute = customMinuteBlocks.includes(minute);
    
    if (!isValidMinute) {
      console.warn(`Minuto inválido detectado: ${minute}. Este jogo não será posicionado na tabela.`);
    }
    
    return { hour, minute, isValidMinute };
  } catch (error) {
    console.error('Erro ao extrair horário:', error);
    return { hour: 0, minute: 0, isValidMinute: false };
  }
}

/**
 * Função para ordenar as horas na sequência decrescente a partir da hora atual
 * A hora atual aparece primeiro, seguida das horas anteriores em ordem decrescente
 * 
 * @param hours - Array de horas para ordenar
 * @param currentHour - Hora atual como referência para ordenação
 * @returns Array ordenado com hora atual primeiro, depois ordem decrescente
 */
function sortHoursInCorrectOrder(hours: number[], currentHour: number): number[] {
  return [...hours].sort((a, b) => {
    // Hora atual sempre vem primeiro
    if (a === currentHour) return -1;
    if (b === currentHour) return 1;
    
    // Para as demais horas, ordem decrescente simples
    // Calcular distância de cada hora em relação à hora atual
    const distA = (currentHour - a + 24) % 24;
    const distB = (currentHour - b + 24) % 24;
    
    // Ordenar por proximidade com a hora atual (menores distâncias primeiro)
    return distA - distB;
  });
}

/**
 * Verifica se uma data está no dia atual (hoje)
 * 
 * @param date - Objeto Date para verificação
 * @returns Verdadeiro se a data for do dia atual
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Hook para converter dados da API em uma tabela organizada por hora e minuto
 * Versão simplificada para revisão da lógica, sem processamento de dados reais
 * 
 * NOTA: Os horários dos jogos SEMPRE correspondem exatamente às combinações de hora:minuto
 * disponíveis na tabela. Não há necessidade de arredondamento ou aproximação de minutos.
 * 
 * @param matches - Array de partidas da API
 * @param hoursFilter - Número de horas a exibir a partir da hora atual
 * @param minutes - Array de minutos específicos para a tabela (opcional)
 * @param testMode - Se verdadeiro, mostra apenas jogos das horas selecionadas (opcional)
 * @param testHour - Hora específica para testar (opcional)
 * @param selectedHours - Array de horas selecionadas para exibir (opcional)
 * @returns Estrutura de dados organizada para preenchimento da tabela
 */
export function useTimeTable(
  matches: IMatch[] = [], 
  hoursFilter: number = 24,
  minutes?: { value: string }[],
  testMode: boolean = false, 
  testHour?: number, 
  selectedHours?: number[]
): { hours: number[], cells: Record<string, { matches: IMatch[] }> } {
  return useMemo(() => {
    // Gerar array de horas (0-23) incluindo todas as horas
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    // Obter a hora atual
    const currentHour = new Date().getHours();
    
    // Preparar horas filtradas para exibição
    let filteredHours: number[];
    
    if (testMode) {
      if (selectedHours && selectedHours.length > 0) {
        // Se houver horas múltiplas selecionadas, usá-las em ordem decrescente
        filteredHours = sortHoursInCorrectOrder(selectedHours, testHour || currentHour);
      } else if (testHour !== undefined) {
        // Se não houver horas múltiplas mas houver uma hora específica, usar essa hora
        filteredHours = [testHour];
      } else {
        // Caso contrário, usar a hora 23 como padrão para testes
        filteredHours = [23];
      }
    } else {
      // Gerar um array com as horas que queremos mostrar
      let hours: number[] = [];
      
      if (hoursFilter >= 24) {
        // Se o filtro for 24 horas ou mais, mostrar todas as horas (0-23)
        hours = [...allHours];
      } else {
        // Adicionar as horas a partir da hora atual até o número definido pelo filtro
        for (let i = 0; i < Math.min(hoursFilter, 24); i++) {
          let hour = currentHour - i;
          // Ajustar horas negativas (ex: se for 1h e quisermos mostrar 3h antes, precisamos mostrar 23, 0, 1)
          if (hour < 0) {
            hour = 24 + hour;
          }
          hours.push(hour);
        }
      }
      
      // Ordenar as horas com a hora atual primeiro, seguida das anteriores em ordem decrescente
      filteredHours = sortHoursInCorrectOrder(hours, currentHour);
    }
    
    // Usar blocos de minutos fixos conforme layout
    let minuteBlocks = FIXED_MINUTE_BLOCKS;
    
    // Se for fornecido um array de minutos específicos, extrair os valores numéricos
    if (minutes && minutes.length > 0) {
      // Extrair valores numéricos dos minutos fornecidos
      const minuteValues = minutes.map(m => parseInt(m.value));
      // Filtrar apenas minutos válidos (não-NaN)
      const validMinutes = minuteValues.filter(m => !isNaN(m));
      
      if (validMinutes.length > 0) {
        // Usar os minutos fornecidos como blocos
        minuteBlocks = validMinutes;
      }
    }
    
    // Inicializar células vazias
    const cells: Record<string, { matches: IMatch[] }> = {};
    
    // Inicializar células com chaves simplificadas de hora e minuto
    // Processamos todas as horas, mesmo no modo de teste, para manter consistência
    allHours.forEach(hour => {
      minuteBlocks.forEach(minute => {
        // Chave simplificada com apenas hora e minuto
        // Como os jogos só ocorrem nesses minutos específicos, a correspondência é exata
        const key = `${hour}:${minute}`;
          
        cells[key] = {
          matches: []
        };
      });
    });
    
    // Processar os dados reais da API
    if (matches.length > 0) {
      // Filtrar apenas jogos finalizados e com dados válidos
      const finishedMatches = matches.filter(isFinishedMatch);
      
      // Em modo de teste, filtrar apenas jogos das horas selecionadas
      const matchesToProcess = testMode 
        ? finishedMatches.filter(match => {
            try {
              const { hour } = extractTimeInfo(match.StartTime, minuteBlocks);
              
              if (selectedHours && selectedHours.length > 0) {
                // Se houver múltiplas horas selecionadas, verificar se a hora está no array
                return selectedHours.includes(hour);
              } else {
                // Caso contrário, usar a hora específica ou 23 como padrão
                const targetHour = testHour !== undefined ? testHour : 23;
                return hour === targetHour;
              }
            } catch (error) {
              console.error('Erro ao processar hora para filtragem:', error);
              return false;
            }
          })
        : finishedMatches;
      
      // Obter a hora atual para verificar jogos do dia atual
      const now = new Date();
      const currentHour = now.getHours();
      
      // Processar partidas e associá-las às células corretas
      matchesToProcess.forEach(match => {
        try {
          // Extrair data e hora do StartTime e verificar se o minuto é válido
          const { hour, minute, isValidMinute } = extractTimeInfo(match.StartTime, minuteBlocks);
          
          // Se o minuto não for válido, registrar um erro e pular este jogo
          if (!isValidMinute) {
            console.error(`Erro: Jogo com minuto inválido (${minute}) não corresponde às colunas da tabela:`, match);
            return; // Pular este jogo
          }
          
          // Verificar se este jogo ocorreu na hora atual e não é do dia atual
          // Isso evita que jogos de dias anteriores sejam exibidos na hora atual
          const matchDate = new Date(match.StartTime);
          const isCurrentHour = hour === currentHour;
          const isMatchToday = isToday(matchDate);
          
          // Se for a hora atual, apenas exibir jogos do dia atual
          if (isCurrentHour && !isMatchToday) {
            return; // Pular este jogo se for da hora atual mas não for do dia atual
          }
          
          // Criar chave simplificada para a célula
          const key = `${hour}:${minute}`;
          
          // Adicionar partida à célula correspondente se ela existir
          if (cells[key]) {
            cells[key].matches.push(match);
          } else {
            console.error(`Erro: Não foi encontrada célula para o horário ${hour}:${minute}`);
          }
        } catch (error) {
          console.error('Erro ao processar partida para a tabela:', error);
        }
      });
    }
    
    return {
      hours: filteredHours,
      cells
    };
  }, [matches, hoursFilter, minutes, testMode, testHour, selectedHours]);
}

/**
 * Hook para formatação padronizada de horas e minutos
 * 
 * @param hour - Número da hora (0-23)
 * @param minute - Número do minuto (0-59)
 * @returns String formatada com zeros à esquerda
 */
export function useTimeFormatter(hour: number, minute: number): string {
  return useMemo(() => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  }, [hour, minute]);
}

/**
 * Hook para obter um resumo das partidas finalizadas em uma célula específica
 * Versão simplificada para revisão da lógica
 * 
 * @param matches - Array de partidas finalizadas na célula
 * @returns Array de strings formatadas com informações resumidas
 */
export function useMatchSummary(matches: IMatch[]): string[] {
  return useMemo(() => {
    // Quando reimplementarmos, este código processará os resumos dos jogos
    if (matches.length === 0) return [];
    
    return matches.map(match => {
      try {
        // Obter nomes das equipes
        const homeTeam = match.DisplayNameParts[0]?.name || 'Time A';
        const awayTeam = match.DisplayNameParts[1]?.name || 'Time B';
        
        // Obter placares
        const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
        const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
        
        // Extrair apenas a hora e o minuto
        const matchDate = new Date(match.StartTime);
        const hour = matchDate.getHours().toString().padStart(2, '0');
        const minute = matchDate.getMinutes().toString().padStart(2, '0');
        
        // Formato: "TimeA 2 x 1 TimeB (HH:MM) - Finalizado"
        return `${homeTeam} ${homeScore} x ${awayScore} ${awayTeam} (${hour}:${minute}) - Finalizado`;
      } catch (error) {
        console.error('Erro ao gerar resumo da partida:', error);
        return 'Erro ao processar informações da partida';
      }
    });
  }, [matches]);
}

/**
 * Hook para calcular estatísticas de resultados por hora do dia
 * Versão simplificada para revisão da lógica
 * 
 * @param matches - Array de partidas finalizadas
 * @param customMinutes - Array de minutos personalizados (opcional)
 * @returns Estatísticas de resultados por hora do dia
 */
export function useHourlyStats(matches: IMatch[], customMinutes?: { value: string }[]) {
  return useMemo(() => {
    // Processar minutos personalizados, se fornecidos
    let minuteBlocks = FIXED_MINUTE_BLOCKS;
    if (customMinutes && customMinutes.length > 0) {
      const minuteValues = customMinutes.map(m => parseInt(m.value)).filter(m => !isNaN(m));
      if (minuteValues.length > 0) {
        minuteBlocks = minuteValues;
      }
    }
    
    const hourStats: Record<number, { 
      totalGames: number,
      homeWins: number,
      awayWins: number,
      draws: number,
      goalsPerGame: number
    }> = {};
    
    // Inicializar estatísticas para cada hora
    for (let i = 0; i < 24; i++) {
      hourStats[i] = {
        totalGames: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        goalsPerGame: 0
      };
    }
    
    // Quando reimplementarmos, este código processará as estatísticas
    if (matches.length > 0) {
      // Filtrar apenas jogos finalizados
      const finishedMatches = matches.filter(isFinishedMatch);
      
      // Calcular estatísticas a partir das partidas
      finishedMatches.forEach(match => {
        try {
          // Extrair informações do horário
          const { hour, isValidMinute } = extractTimeInfo(match.StartTime, minuteBlocks);
          
          // Pular jogos com minutos inválidos
          if (!isValidMinute) return;
          
          const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
          const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
          const totalGoals = homeScore + awayScore;
          
          // Incrementar contadores
          hourStats[hour].totalGames += 1;
          
          if (homeScore > awayScore) {
            hourStats[hour].homeWins += 1;
          } else if (homeScore < awayScore) {
            hourStats[hour].awayWins += 1;
          } else {
            hourStats[hour].draws += 1;
          }
          
          // Acumular gols para média
          hourStats[hour].goalsPerGame = 
            (hourStats[hour].goalsPerGame * (hourStats[hour].totalGames - 1) + totalGoals) / 
            hourStats[hour].totalGames;
        } catch (error) {
          console.error('Erro ao processar estatísticas:', error);
        }
      });
    }
    
    return hourStats;
  }, [matches, customMinutes]);
} 