/**
 * Serviço de API - Responsável por todas as comunicações com endpoints externos
 * Implementa cache, tratamento de erros e timeout para melhorar a performance e robustez
 */

// Interface para os dados de partida
export interface IMatch {
  id: string;
  EventId: string;
  RegionId: string;
  Liga: string;
  DisplayNameParts: Array<{name: string}>;
  StartTime: string;
  Markets: Array<{
    Name: string;
    Selections: Array<{
      Name: string;
      FullName: string | null;
      Price: number;
    }>
  }>;
  FullTimeHomeTeam: string;
  FullTimeAwayTeam: string;
  HalfTimeHomeTeam: string;
  HalfTimeAwayTeam: string;
}

// Configurações do serviço
const API_CONFIG = {
  BASE_URL: 'https://easy-api-betano-fv.u6y5np.easypanel.host',
  TIMEOUT: 10000, // 10 segundos
  CACHE_TIME: 10000, // 10 segundos (era 60000 - 1 minuto)
}

// Sistema de cache para evitar requisições duplicadas
interface ICacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private static cache: Record<string, ICacheItem<any>> = {};

  // Armazena dados no cache com chave única
  static set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  // Recupera dados do cache se ainda forem válidos
  static get<T>(key: string): T | null {
    const item = this.cache[key];
    
    if (!item) return null;
    
    // Verifica se o cache ainda é válido
    if (Date.now() - item.timestamp > API_CONFIG.CACHE_TIME) {
      delete this.cache[key];
      return null;
    }
    
    return item.data;
  }

  // Limpa um item específico do cache
  static clear(key: string): void {
    delete this.cache[key];
  }

  // Limpa todo o cache
  static clearAll(): void {
    this.cache = {};
  }
}

/**
 * Classe principal do serviço de API
 */
class ApiService {
  /**
   * Busca jogos da API com tratamento de erros e cache
   * @param liga - Nome da liga para filtrar os jogos
   * @param result - Parâmetro adicional para a consulta
   * @returns Uma Promise com os dados ou um erro estruturado
   */
  async getMatches(liga: string = 'euro', result: string = '480'): Promise<IMatch[]> {
    const cacheKey = `matches_${liga}_${result}`;
    
    // Sempre limpa o cache para garantir dados atualizados
    CacheManager.clear(cacheKey);
    
    // Verifica se já temos esses dados em cache
    const cachedData = CacheManager.get<IMatch[]>(cacheKey);
    if (cachedData) {
      console.log('Dados recuperados do cache');
      return cachedData;
    }

    // Cria uma Promise com timeout para evitar requisições pendentes
    const fetchPromise = fetch(`${API_CONFIG.BASE_URL}/api.php?liga=${liga}&result=${result}`);
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout da requisição')), API_CONFIG.TIMEOUT);
    });

    try {
      // Compete entre o fetch e o timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Valida a estrutura dos dados
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }
      
      // Armazena em cache para futuras requisições
      CacheManager.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }

  /**
   * Extrai hora e minuto do formato de data da API
   * @param startTime - String de data/hora no formato da API
   * @returns Objeto com hora e minuto
   */
  extractTimeFromMatch(startTime: string): { hour: number; minute: number } {
    try {
      const date = new Date(startTime);
      return {
        hour: date.getHours(),
        minute: date.getMinutes()
      };
    } catch (error) {
      console.error('Erro ao extrair horário:', error);
      return { hour: 0, minute: 0 };
    }
  }

  /**
   * Obtém o placar de uma partida
   * @param match - Objeto da partida com os dados do placar
   * @returns Objeto estruturado com os placares de primeiro e segundo tempo
   */
  getMatchScore(match: IMatch): {
    fullTime: { home: number; away: number };
    halfTime: { home: number; away: number };
  } {
    return {
      fullTime: {
        home: parseInt(match.FullTimeHomeTeam) || 0,
        away: parseInt(match.FullTimeAwayTeam) || 0
      },
      halfTime: {
        home: parseInt(match.HalfTimeHomeTeam) || 0,
        away: parseInt(match.HalfTimeAwayTeam) || 0
      }
    };
  }
}

// Exporta instância única do serviço para uso em toda aplicação
export const apiService = new ApiService(); 