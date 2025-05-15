import { IMatch } from '../services/api';

// Interface que define a estrutura de células
export interface ITableCells {
  [key: string]: {
    matches: IMatch[];
  };
}

// Definição dos blocos de minutos específicos para a Taça Glória Eterna
// Replicamos os mesmos da Euro League para manter a mesma lógica
export const FIXED_MINUTE_BLOCKS = [
  '01', '04', '07', '10', '13', '16', '19', '22',
  '25', '28', '31', '34', '37', '40', '43', '46',
  '49', '52', '55', '58'
];

/**
 * Hook para processar os dados da tabela de Taça Glória Eterna
 * Similar ao useTimeTable mas específico para esta liga
 */
export const useTacaGloriaEternaTable = (
  matches: IMatch[],
  onlyFinished: boolean = true,
  leagueId?: string,
  filteredHours?: number[]
): { cells: ITableCells } => {
  // Estrutura para armazenar os jogos organizados por célula (hora:minuto)
  const cells: ITableCells = {};

  // Filtramos apenas jogos que têm resultados (homeScore e awayScore são diferentes de null/undefined)
  const filteredMatches = onlyFinished 
    ? matches.filter(match => match.FullTimeHomeTeam !== undefined && match.FullTimeAwayTeam !== undefined)
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
      const minute = String(matchDate.getMinutes()).padStart(2, '0');

      // Verificar se o minuto está nos blocos específicos da Taça Glória Eterna
      if (!FIXED_MINUTE_BLOCKS.includes(minute)) {
        return; // Pular jogos que não estão nos minutos exatos
      }
      
      // Filtrar jogos por hora se houver filtragem de horas
      if (filteredHours && !filteredHours.includes(hour)) {
        return;
      }

      // Criar a chave para a célula (hora:minuto)
      const cellKey = `${hour}:${parseInt(minute)}`;
      
      // Inicializar a célula se não existir
      if (!cells[cellKey]) {
        cells[cellKey] = {
          matches: []
        };
      }
      
      // Adicionar o jogo à célula
      cells[cellKey].matches.push(match);
    } catch (error) {
      console.error('Erro ao processar jogo:', error, match);
    }
  });

  return { cells };
}; 