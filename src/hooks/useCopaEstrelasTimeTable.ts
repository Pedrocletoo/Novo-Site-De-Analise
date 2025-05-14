import { useMemo } from 'react';
import { IMatch } from '../services/api';

// Estrutura para a célula da tabela da Copa das Estrelas
export interface ICopaEstrelasTimeCell {
  hour: number;
  minute: number;
  matches: IMatch[];
}

// Estrutura da tabela de tempo da Copa das Estrelas
export interface ICopaEstrelasTimeTable {
  hours: number[];
  minuteBlocks: number[];
  cells: Record<string, ICopaEstrelasTimeCell>;
}

/**
 * IMPORTANTE: Os minutos dos jogos para a Copa das Estrelas SEMPRE correspondem exatamente 
 * aos minutos definidos abaixo.
 * Não existem jogos em minutos intermediários ou aproximados.
 * Cada jogo começa exatamente em um dos minutos listados abaixo, garantindo
 * correspondência direta com as colunas da tabela.
 */
const COPA_ESTRELAS_MINUTE_BLOCKS = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57];

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
 * conforme os blocos de minutos fixos da tabela da Copa das Estrelas
 * 
 * REGRA CRÍTICA: Os jogos SEMPRE começam exatamente nos minutos específicos definidos em COPA_ESTRELAS_MINUTE_BLOCKS.
 * Qualquer jogo cujo minuto não esteja exatamente nessa lista deve ser considerado inválido
 * e não deve ser posicionado na tabela.
 * 
 * @param startTime - String com o horário de início no formato "YYYY-MM-DD HH:MM:SS"
 * @returns Objeto com hora, minuto e flag indicando se o minuto está nas colunas da tabela
 */
function extractTimeInfo(startTime: string): { hour: number; minute: number; isValidMinute: boolean } {
  try {
    // A API retorna data no formato "YYYY-MM-DD HH:MM:SS"
    console.log('Processando data/hora:', startTime);
    
    // Extrair a parte de hora/minuto da string
    const timeParts = startTime.split(' ');
    const timeString = timeParts.length >= 2 ? timeParts[1] : startTime;
    
    // Extrair hora e minuto da parte de hora
    const hourMinute = timeString.split(':');
    const hour = parseInt(hourMinute[0]);
    const minute = parseInt(hourMinute[1]);
    
    console.log(`Extraído hora: ${hour}, minuto: ${minute}`);
    
    // Verificar explicitamente se o minuto extraído corresponde exatamente a um dos minutos da tabela da Copa das Estrelas
    // Isso é CRUCIAL para o correto posicionamento dos jogos na tabela
    const isValidMinute = COPA_ESTRELAS_MINUTE_BLOCKS.includes(minute);
    
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
 * Função para ordenar as horas na mesma sequência da tabela de futebol virtual
 * Primeiro exibe horas de 17 a 0 em ordem decrescente, depois 23 a 18 em ordem decrescente
 */
function sortHoursInCorrectOrder(hours: number[]): number[] {
  return [...hours].sort((a, b) => {
    // Se um está na faixa 0-17 e o outro na faixa 18-23
    const aIsLower = a <= 17;
    const bIsLower = b <= 17;
    
    // Se estão em faixas diferentes
    if (aIsLower !== bIsLower) {
      // A hora na faixa 0-17 vem primeiro (após ordenação decrescente)
      return aIsLower ? -1 : 1;
    }
    
    // Se estão na mesma faixa, ordem decrescente normal
    return b - a;
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
 * Hook para converter dados da API em uma tabela organizada por hora e minuto específicos para a Copa das Estrelas
 * 
 * NOTA: Os horários dos jogos SEMPRE correspondem exatamente às combinações de hora:minuto
 * disponíveis na tabela. Não há necessidade de arredondamento ou aproximação de minutos.
 * 
 * @param matches - Array de partidas da API
 * @param testMode - Se verdadeiro, mostra apenas jogos das horas selecionadas
 * @param testHour - Hora específica para testar (opcional)
 * @param selectedHours - Array de horas selecionadas para exibir (opcional)
 * @returns Estrutura de dados organizada para preenchimento da tabela
 */
export function useCopaEstrelasTimeTable(matches: IMatch[] = [], testMode = false, testHour?: number, selectedHours?: number[]): ICopaEstrelasTimeTable {
  return useMemo(() => {
    // Gerar array de horas (0-23) incluindo todas as horas
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    // Aplicar ordem decrescente para exibição
    let hours;
    
    if (testMode) {
      if (selectedHours && selectedHours.length > 0) {
        // Se houver horas múltiplas selecionadas, usá-las em ordem decrescente
        // com a sequência correta da tabela de futebol virtual
        hours = sortHoursInCorrectOrder(selectedHours);
      } else if (testHour !== undefined) {
        // Se não houver horas múltiplas mas houver uma hora específica, usar essa hora
        hours = [testHour];
      } else {
        // Caso contrário, usar a hora 23 como padrão para testes
        hours = [23];
      }
    } else {
      // Em modo normal, ordenar horas na mesma sequência da tabela de futebol virtual
      hours = sortHoursInCorrectOrder(allHours);
    }
    
    // Usar blocos de minutos para a Copa das Estrelas
    const minuteBlocks = COPA_ESTRELAS_MINUTE_BLOCKS;
    
    // Inicializar células vazias
    const cells: Record<string, ICopaEstrelasTimeCell> = {};
    
    // Inicializar células com chaves simplificadas de hora e minuto
    // Processamos todas as horas, mesmo no modo de teste, para manter consistência
    allHours.forEach(hour => {
      minuteBlocks.forEach(minute => {
        // Chave simplificada com apenas hora e minuto
        // Como os jogos só ocorrem nesses minutos específicos, a correspondência é exata
        const key = `${hour}:${minute}`;
          
        cells[key] = {
          hour,
          minute,
          matches: []
        };
      });
    });
    
    // Processar os dados reais da API
    if (matches.length > 0) {
      // Filtrar apenas jogos finalizados e com dados válidos
      const finishedMatches = matches.filter(isFinishedMatch);
      
      // Em modo de teste, filtrar apenas jogos das horas selecionadas
      const filteredMatches = testMode 
        ? finishedMatches.filter(match => {
            try {
              const { hour } = extractTimeInfo(match.StartTime);
              
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
      filteredMatches.forEach(match => {
        try {
          // Extrair data e hora do StartTime e verificar se o minuto é válido
          const { hour, minute, isValidMinute } = extractTimeInfo(match.StartTime);
          
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
          console.error('Erro ao processar horário da partida:', match.StartTime, error);
        }
      });
    }
    
    return {
      hours,
      minuteBlocks,
      cells
    };
  }, [matches, testMode, testHour, selectedHours]);
} 