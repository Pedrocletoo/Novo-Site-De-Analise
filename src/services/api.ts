/**
 * API Service - Serviço base para acessar a API de dados
 * Versão otimizada que serve apenas como acesso direto à API
 */

// Definição da interface de partida
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
}

/**
 * Classe principal do serviço de API (sem cache interno)
 * Agora serve apenas para acessar a API de forma direta
 */
class ApiService {
  /**
   * Busca jogos da API com tratamento de erros
   * @param liga - Nome da liga para filtrar os jogos
   * @param result - Parâmetro adicional para a consulta
   * @returns Uma Promise com os dados ou um erro estruturado
   */
  async getMatches(liga: string = 'euro', result: string = '480'): Promise<IMatch[]> {
    // Cria uma Promise com timeout para evitar requisições pendentes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
      // Fazer requisição à API
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api.php?liga=${liga}&result=${result}`,
        { signal: controller.signal }
      );
      
      // Limpar o timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Valida a estrutura dos dados
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }
      
      return data;
    } catch (error) {
      // Limpar o timeout em caso de erro
      clearTimeout(timeoutId);
      
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

// Exportar instância única
export const apiService = new ApiService(); 