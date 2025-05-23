import { useMemo } from 'react';
import { IMatch } from '../services/api';

// Definição dos blocos de minutos específicos para a Taça Glória Eterna
// Replicamos os mesmos da Euro League para manter a mesma lógica
export const FIXED_MINUTE_BLOCKS = [
  '01', '04', '07', '10', '13', '16', '19', '22',
  '25', '28', '31', '34', '37', '40', '43', '46',
  '49', '52', '55', '58'
].map(minute => parseInt(minute));

/**
 * Função para ordenar as horas na mesma sequência da tabela
 * Primeiro exibe a hora atual, depois as horas anteriores em ordem decrescente
 */
function sortHoursInCorrectOrder(hours: number[]): number[] {
  // Primeiro garantir que a hora atual seja a primeira da lista
  const sortedHours = [...hours];
  const currentHour = new Date().getHours();
  
  // Remover a hora atual da lista se existir
  const currentHourIndex = sortedHours.indexOf(currentHour);
  if (currentHourIndex !== -1) {
    sortedHours.splice(currentHourIndex, 1);
  }
  
  // Ordenar todas as horas em ordem decrescente a partir da hora atual
  // Horas menores que a atual (em ordem decrescente)
  const hoursBelowCurrent = sortedHours
    .filter(h => h < currentHour)
    .sort((a, b) => b - a);
  
  // Horas maiores que a atual (em ordem decrescente)
  const hoursAboveCurrent = sortedHours
    .filter(h => h > currentHour)
    .sort((a, b) => b - a);
  
  // Retornar com a hora atual como primeira, seguida das outras horas em ordem decrescente
  return [currentHour, ...hoursBelowCurrent, ...hoursAboveCurrent];
}

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
 * Hook para processar os dados da tabela de Taça Glória Eterna
 * Similar ao useTimeTable mas específico para esta liga
 * 
 * @param matches - Array de partidas da API
 * @param hoursFilter - Número de horas a exibir a partir da hora atual
 * @param onlyFinished - Se verdadeiro, filtra apenas jogos finalizados
 * @param leagueId - ID da liga para filtragem (opcional)
 * @param customFilteredHours - Array de horas customizado para exibir (opcional)
 * @returns Estrutura de dados organizada para preenchimento da tabela
 */
export const useTacaGloriaEternaTable = (
  matches: IMatch[],
  hoursFilter: number = 24,
  onlyFinished: boolean = true,
  leagueId?: string,
  customFilteredHours?: number[]
): { hours: number[], cells: Record<string, { matches: IMatch[] }> } => {
  return useMemo(() => {
    // Gerar array de horas (0-23) incluindo todas as horas
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    // Determinar quais horas mostrar
    let filteredHours: number[];
    
    if (customFilteredHours && customFilteredHours.length > 0) {
      // Se horas personalizadas forem fornecidas, usá-las
      filteredHours = sortHoursInCorrectOrder(customFilteredHours);
    } else {
      // Caso contrário, gerar a partir do filtro de horas
      const currentHour = new Date().getHours();
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
      filteredHours = sortHoursInCorrectOrder(hours);
    }
    
    // Estrutura para armazenar os jogos organizados por célula (hora:minuto)
    const cells: Record<string, { matches: IMatch[] }> = {};
    
    // Inicializar todas as células possíveis
    allHours.forEach(hour => {
      FIXED_MINUTE_BLOCKS.forEach(minute => {
        const cellKey = `${hour}:${minute}`;
        cells[cellKey] = { matches: [] };
      });
    });

    // Filtramos apenas jogos finalizados com dados válidos
    const filteredMatches = onlyFinished 
      ? matches.filter(isFinishedMatch)
      : matches;
      
    // Filtrar por liga se um ID for fornecido (adaptando para o campo Liga em vez de LeagueId)
    const leagueMatches = leagueId 
      ? filteredMatches.filter(match => match.Liga === leagueId) 
      : filteredMatches;

    // Organizar os jogos nas células corretas da tabela
    leagueMatches.forEach(match => {
      try {
        if (!match.StartTime) return;
        
        // Extrair a data e hora do jogo
        const matchDate = new Date(match.StartTime);
        const hour = matchDate.getHours();
        const minute = matchDate.getMinutes();

        // Verificar se o minuto está nos blocos específicos da Taça Glória Eterna
        if (!FIXED_MINUTE_BLOCKS.includes(minute)) {
          return; // Pular jogos que não estão nos minutos exatos
        }

        // Obter a hora atual para verificar jogos do dia atual
        const now = new Date();
        const currentHour = now.getHours();
        
        // Verificar se este jogo ocorreu na hora atual e não é do dia atual
        // Isso evita que jogos de dias anteriores sejam exibidos na hora atual
        const isCurrentHour = hour === currentHour;
        const isMatchToday = isToday(matchDate);
        
        // Se for a hora atual, apenas exibir jogos do dia atual
        if (isCurrentHour && !isMatchToday) {
          return; // Pular este jogo se for da hora atual mas não for do dia atual
        }

        // Criar a chave para a célula (hora:minuto)
        const cellKey = `${hour}:${minute}`;
        
        // Adicionar o jogo à célula
        if (cells[cellKey]) {
          cells[cellKey].matches.push(match);
        }
      } catch (error) {
        console.error('Erro ao processar jogo:', error, match);
      }
    });

    return { hours: filteredHours, cells };
  }, [matches, hoursFilter, onlyFinished, leagueId, customFilteredHours]);
}; 