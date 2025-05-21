/**
 * Cache Service - Sistema de cache centralizado para dados da API
 * 
 * IMPORTANTE: Esta é uma implementação simulada usando localStorage.
 * Em produção, isso seria substituído por um cache Redis real.
 */

// Interface para item de cache
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

// Configurações do cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300000, // 5 minutos padrão (aumentado significativamente)
  LEAGUES: {
    'euro': 180000,           // 3 minutos para Euro League
    'campeonato-italiano': 180000, // 3 minutos para Campeonato Italiano
    'taca-gloria-eterna': 180000,  // 3 minutos para Taça Glória Eterna
    'br4-italy': 180000,         // 3 minutos para BR4 Itália
    'br4-england': 180000,       // 3 minutos para BR4 Inglaterra
    'br4-spain': 180000,         // 3 minutos para BR4 Espanha
    'br4-brasil': 180000,        // 3 minutos para BR4 Brasil
    'br4-america-latina': 180000 // 3 minutos para BR4 América Latina
  }
};

/**
 * Classe CacheService - Gerencia o cache centralizado
 * Simula um Redis com localStorage, mas mantém a mesma interface
 * que seria usada com um Redis real
 */
class CacheService {
  private prefix = 'betano_cache:';
  private memoryCache: Record<string, any> = {}; // Cache em memória como fallback
  
  /**
   * Gera uma chave para o cache
   * @param key - Identificador único do dado
   * @returns Chave formatada para o cache
   */
  private generateKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  /**
   * Armazena dados no cache
   * @param key - Chave única para identificação
   * @param data - Dados a serem armazenados
   * @param ttl - Tempo de vida em milissegundos (opcional)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = this.generateKey(key);
    
    // Determinar TTL apropriado
    let expiration = ttl || CACHE_CONFIG.DEFAULT_TTL;
    
    // Usar TTL específico para ligas se estiver no formato 'matches_liga_X'
    if (key.startsWith('matches_')) {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const league = parts[1];
        if (CACHE_CONFIG.LEAGUES[league]) {
          expiration = CACHE_CONFIG.LEAGUES[league];
        }
      }
    }
    
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + expiration
    };
    
    // Sempre armazenar em memória primeiro (garantia)
    this.memoryCache[cacheKey] = cacheItem;
    
    // Tentar armazenar no localStorage também
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      console.log(`Cache: Dados armazenados para ${key} (TTL: ${expiration}ms)`);
    } catch (error) {
      console.warn('Erro ao armazenar no localStorage, usando apenas memória:', error);
    }
  }
  
  /**
   * Recupera dados do cache, opcionalmente ignorando expiração
   * @param key - Chave única do dado
   * @param ignoreExpiration - Se true, retorna dados mesmo que expirados
   * @returns Dados armazenados ou null se não existir
   */
  get<T>(key: string, ignoreExpiration: boolean = false): T | null {
    const cacheKey = this.generateKey(key);
    
    // Verificar primeiro no cache em memória (mais rápido)
    const memoryItem = this.memoryCache[cacheKey];
    if (memoryItem) {
      if (ignoreExpiration || Date.now() <= memoryItem.expiration) {
        return memoryItem.data;
      }
    }
    
    // Se não encontrou ou expirou na memória, tentar no localStorage
    try {
      const rawData = localStorage.getItem(cacheKey);
      
      if (!rawData) {
        return null;
      }
      
      const cacheItem = JSON.parse(rawData);
      
      // Verificar expiração, a menos que seja solicitado para ignorar
      if (!ignoreExpiration && Date.now() > cacheItem.expiration) {
        // Remover item expirado
        this.delete(key);
        return null;
      }
      
      // Atualizar cache em memória
      this.memoryCache[cacheKey] = cacheItem;
      
      return cacheItem.data;
    } catch (error) {
      console.error('Erro ao recuperar do cache:', error);
      return null;
    }
  }
  
  /**
   * Remove um item específico do cache
   * @param key - Chave do item a ser removido
   */
  delete(key: string): void {
    const cacheKey = this.generateKey(key);
    
    // Remover da memória
    delete this.memoryCache[cacheKey];
    
    // Tentar remover do localStorage
    try {
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Erro ao remover do localStorage:', error);
    }
  }
  
  /**
   * Remove todos os itens do cache relacionados à aplicação
   */
  clear(): void {
    // Limpar cache em memória primeiro
    this.memoryCache = {};
    
    // Tentar limpar localStorage
    try {
      // Remover apenas as chaves que começam com nosso prefixo
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }
  
  /**
   * Lista todas as chaves armazenadas no cache
   * @returns Array de chaves de cache
   */
  keys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }
  
  /**
   * Verifica quanto tempo resta até a expiração de um item em cache
   * @param key - Chave do item no cache
   * @param ignoreExpiration - Se true, retorna dados mesmo que expirados
   * @returns Tempo restante em milissegundos ou 0 se expirado/não existente
   */
  getTimeToLive(key: string): number {
    const cacheKey = this.generateKey(key);
    
    // Verificar primeiro no cache em memória
    const memoryItem = this.memoryCache[cacheKey];
    if (memoryItem) {
      const timeLeft = memoryItem.expiration - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    }
    
    // Tentar no localStorage
    try {
      const rawData = localStorage.getItem(cacheKey);
      
      if (!rawData) {
        return 0;
      }
      
      const cacheItem = JSON.parse(rawData);
      const timeLeft = cacheItem.expiration - Date.now();
      
      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      console.error('Erro ao verificar TTL do cache:', error);
      return 0;
    }
  }
}

// Exporta instância única para uso em toda a aplicação
export const cacheService = new CacheService(); 