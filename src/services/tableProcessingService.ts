/**
 * TableProcessingService - Serviço especializado para processamento de dados de tabelas
 * 
 * Este serviço é responsável por transformar os dados brutos da API em estruturas
 * otimizadas para renderização rápida nas tabelas. Ele implementa técnicas de:
 * 
 * 1. Processamento em lote dos dados
 * 2. Estruturação de dados para acesso rápido
 * 3. Cálculos de estatísticas pré-computados
 * 4. Cache de resultados para evitar reprocessamento
 */

import { IMatch } from '../services/api';
import { cacheService } from './cacheService';

// Tipos e interfaces para processamento de dados
export interface ProcessedTableData {
  rows: ProcessedRow[];
  stats: TableStats;
  lastProcessed: Date;
}

export interface ProcessedRow {
  hourKey: string;
  cells: Record<string, ProcessedCell>;
  stats?: RowStats;
}

export interface ProcessedCell {
  matches: IMatch[];
  isEmpty: boolean;
  homeScore?: number;
  awayScore?: number;
  totalGoals?: number;
  isHomeWin?: boolean;
  isAwayWin?: boolean;
  isDraw?: boolean;
  // Dados pré-calculados para renderização rápida
  color?: string;
  styleClass?: string;
}

export interface TableStats {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
  // Estatísticas por minuto
  byMinute: Record<string, MinuteStats>;
}

export interface RowStats {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
}

export interface MinuteStats {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGoals: number;
  consecutiveHomeWins: number;
  consecutiveAwayWins: number;
  consecutiveDraws: number;
}

// Constantes para configuração
const CACHE_TTL = 60000; // 1 minuto
const MINUTE_BLOCKS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/**
 * Classe principal do serviço de processamento de tabelas
 */
class TableProcessingService {
  /**
   * Processa os dados brutos da API para uma estrutura otimizada para tabelas
   * 
   * @param matches - Array de partidas da API
   * @param liga - Nome da liga para filtrar
   * @param hoursFilter - Quantidade de horas a exibir
   * @param timeFilter - Filtro de tempo ("HT" para primeiro tempo, "FT" para tempo total)
   * @returns Dados processados para renderização rápida
   */
  processMatchesForTable(
    matches: IMatch[],
    liga: string,
    hoursFilter: number = 24,
    timeFilter: string = "FT"
  ): ProcessedTableData {
    // Verificar se há dados em cache
    const cacheKey = `processed_table_${liga}_${hoursFilter}_${timeFilter}`;
    const cachedData = cacheService.get<ProcessedTableData>(cacheKey);
    
    if (cachedData) {
      console.log(`Usando dados processados do cache para ${liga}`);
      return cachedData;
    }
    
    console.log(`Processando ${matches.length} partidas para tabela de ${liga}`);
    const startTime = performance.now();
    
    // Inicializar estatísticas da tabela
    const tableStats: TableStats = {
      totalMatches: 0,
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      totalGoals: 0,
      byMinute: {}
    };
    
    // Inicializar estatísticas por minuto
    MINUTE_BLOCKS.forEach(minute => {
      tableStats.byMinute[minute] = {
        totalMatches: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGoals: 0,
        consecutiveHomeWins: 0,
        consecutiveAwayWins: 0,
        consecutiveDraws: 0
      };
    });
    
    // Filtrar partidas apenas da liga especificada
    const leagueMatches = matches.filter(match => match.Liga === liga);
    
    // Obter horas a serem exibidas
    const hours = this._getFilteredHours(hoursFilter);
    
    // Processar dados por hora
    const rows: ProcessedRow[] = hours.map(hour => {
      const cells: Record<string, ProcessedCell> = {};
      const rowStats: RowStats = {
        totalMatches: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGoals: 0
      };
      
      // Inicializar células para cada minuto
      MINUTE_BLOCKS.forEach(minute => {
        cells[minute] = {
          matches: [],
          isEmpty: true
        };
      });
      
      // Filtrar partidas para esta hora
      const hourMatches = leagueMatches.filter(match => {
        try {
          const matchDate = new Date(match.StartTime);
          return matchDate.getHours() === hour;
        } catch (e) {
          return false;
        }
      });
      
      // Distribuir partidas nas células de minutos
      hourMatches.forEach(match => {
        try {
          const matchDate = new Date(match.StartTime);
          const minute = matchDate.getMinutes();
          
          // Verificar se o minuto está nos blocos definidos
          if (!MINUTE_BLOCKS.includes(minute)) return;
          
          // Obter scores conforme o filtro de tempo
          const homeScore = timeFilter === "HT" 
            ? parseInt(match.HalfTimeHomeTeam) || 0
            : parseInt(match.FullTimeHomeTeam) || 0;
            
          const awayScore = timeFilter === "HT"
            ? parseInt(match.HalfTimeAwayTeam) || 0
            : parseInt(match.FullTimeAwayTeam) || 0;
          
          const totalGoals = homeScore + awayScore;
          const isHomeWin = homeScore > awayScore;
          const isAwayWin = homeScore < awayScore;
          const isDraw = homeScore === awayScore;
          
          // Atualizar estatísticas da linha
          rowStats.totalMatches++;
          rowStats.totalGoals += totalGoals;
          if (isHomeWin) rowStats.homeWins++;
          if (isAwayWin) rowStats.awayWins++;
          if (isDraw) rowStats.draws++;
          
          // Atualizar estatísticas da tabela
          tableStats.totalMatches++;
          tableStats.totalGoals += totalGoals;
          if (isHomeWin) tableStats.homeWins++;
          if (isAwayWin) tableStats.awayWins++;
          if (isDraw) tableStats.draws++;
          
          // Atualizar estatísticas por minuto
          tableStats.byMinute[minute].totalMatches++;
          tableStats.byMinute[minute].totalGoals += totalGoals;
          if (isHomeWin) {
            tableStats.byMinute[minute].homeWins++;
            tableStats.byMinute[minute].consecutiveHomeWins++;
            tableStats.byMinute[minute].consecutiveAwayWins = 0;
            tableStats.byMinute[minute].consecutiveDraws = 0;
          }
          if (isAwayWin) {
            tableStats.byMinute[minute].awayWins++;
            tableStats.byMinute[minute].consecutiveAwayWins++;
            tableStats.byMinute[minute].consecutiveHomeWins = 0;
            tableStats.byMinute[minute].consecutiveDraws = 0;
          }
          if (isDraw) {
            tableStats.byMinute[minute].draws++;
            tableStats.byMinute[minute].consecutiveDraws++;
            tableStats.byMinute[minute].consecutiveHomeWins = 0;
            tableStats.byMinute[minute].consecutiveAwayWins = 0;
          }
          
          // Determinar a cor da célula baseada no resultado
          let color = 'white';
          if (isHomeWin) color = 'green';
          if (isAwayWin) color = 'red';
          
          // Preencher a célula com dados processados
          cells[minute] = {
            matches: [match],
            isEmpty: false,
            homeScore,
            awayScore,
            totalGoals,
            isHomeWin,
            isAwayWin,
            isDraw,
            color,
            styleClass: this._getStyleClass(isHomeWin, isAwayWin, isDraw)
          };
        } catch (error) {
          console.error('Erro ao processar partida:', error);
        }
      });
      
      return {
        hourKey: `${hour}`,
        cells,
        stats: rowStats
      };
    });
    
    // Criar estrutura final de dados processados
    const processedData: ProcessedTableData = {
      rows,
      stats: tableStats,
      lastProcessed: new Date()
    };
    
    // Medir tempo de processamento
    const processingTime = performance.now() - startTime;
    console.log(`Processamento concluído em ${processingTime.toFixed(2)}ms`);
    
    // Armazenar em cache
    cacheService.set(cacheKey, processedData, CACHE_TTL);
    
    return processedData;
  }
  
  /**
   * Obtém um array de horas filtradas para exibição
   * 
   * @param hoursFilter - Número de horas a incluir
   * @returns Array de horas ordenadas
   */
  private _getFilteredHours(hoursFilter: number): number[] {
    const currentHour = new Date().getHours();
    const hours: number[] = [];
    
    // Adicionar a hora atual primeiro
    hours.push(currentHour);
    
    // Adicionar horas anteriores em ordem decrescente
    for (let i = 1; i < hoursFilter; i++) {
      const hour = (currentHour - i + 24) % 24;
      hours.push(hour);
    }
    
    return hours;
  }
  
  /**
   * Determina a classe CSS para estilização da célula
   * 
   * @param isHomeWin - Se é vitória do time da casa
   * @param isAwayWin - Se é vitória do time visitante
   * @param isDraw - Se é empate
   * @returns String com nome da classe CSS
   */
  private _getStyleClass(isHomeWin: boolean, isAwayWin: boolean, isDraw: boolean): string {
    if (isHomeWin) return 'home-win';
    if (isAwayWin) return 'away-win';
    if (isDraw) return 'draw';
    return '';
  }
  
  /**
   * Analisa padrões em uma coluna (minuto específico)
   * 
   * @param liga - Liga a analisar
   * @param minute - Minuto a analisar
   * @returns Estatísticas da coluna
   */
  getColumnAnalysis(liga: string, minute: number): MinuteStats | null {
    // Verificar se há dados em cache
    const cacheKey = `column_analysis_${liga}_${minute}`;
    return cacheService.get<MinuteStats>(cacheKey);
  }
  
  /**
   * Limpa o cache de dados processados
   * 
   * @param liga - Liga específica ou all para todas
   */
  clearProcessedCache(liga: string = 'all'): void {
    if (liga === 'all') {
      console.log('Limpando todo o cache de dados processados');
      // Limpar todos os caches relacionados a tabelas
      const keysToDelete: string[] = [];
      
      // Simulação simplificada de limpeza de cache
      // Em uma implementação real, seria necessário percorrer o storage
      // eslint-disable-next-line no-restricted-globals
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('processed_table_')) {
          keysToDelete.push(key);
        }
      }
      
      // Excluir as chaves
      keysToDelete.forEach(key => {
        cacheService.delete(key);
      });
    } else {
      console.log(`Limpando cache de dados processados para ${liga}`);
      // Limpar apenas caches da liga específica
      const keysToDelete: string[] = [];
      
      // eslint-disable-next-line no-restricted-globals
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`processed_table_${liga}`)) {
          keysToDelete.push(key);
        }
      }
      
      // Excluir as chaves
      keysToDelete.forEach(key => {
        cacheService.delete(key);
      });
    }
  }
}

// Exportar instância única
export const tableProcessingService = new TableProcessingService(); 