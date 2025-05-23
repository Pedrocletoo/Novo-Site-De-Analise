/**
 * Cached API Service - Serviço de API otimizado com cache central e worker
 * Substituição para o ApiService original com foco em performance
 */

import { IMatch, apiService } from './api';
import { cacheService } from './cacheService';
import { workerService } from './workerService';

// Tipo para eventos de atualização
export type CachedApiUpdateListener = (data: IMatch[], source: string) => void;

/**
 * Classe responsável por fornecer dados da API com acesso instantâneo ao cache
 * Implementa fallback para a API direta quando necessário
 */
class CachedApiService {
  private updateListeners: Record<string, CachedApiUpdateListener[]> = {};
  private isInitialized = false;
  private lastUpdatedMap = new Map<string, Date>();
  private pendingRequests = new Map<string, Promise<IMatch[]>>();
  
  /**
   * Inicializa o serviço e os workers
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    // Inicializar o serviço de worker
    workerService.initialize();
    
    this.isInitialized = true;
    console.log('CachedApiService inicializado com sucesso.');
  }
  
  /**
   * Obtém partidas para uma liga específica
   * @param league O código da liga
   * @param result Filtro de resultado opcional
   * @returns Array de partidas
   */
  public async getMatches(league: string, result?: string): Promise<IMatch[]> {
    const cacheKey = `matches_${league}_480`;
    const isPriorityLeague = league === 'campeonato-italiano' || league === 'taca-gloria-eterna';
    
    // PRIORIDADE 1: Cache válido
    const cachedData = cacheService.get<IMatch[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      console.log(`🏆 Usando ${cachedData.length} partidas do cache para ${league}`);
      
      // Verificar idade do cache e atualizar em background se necessário
      const timeLeft = cacheService.getTimeToLive(cacheKey);
      // Ajuste para todas as ligas terem o mesmo threshold
      const refreshThreshold = 150000; // 2.5 minutos para todas as ligas
      
      if (timeLeft < refreshThreshold) { // Threshold padronizado para todas as ligas
        console.log(`⏱️ Cache expirando em ${Math.round(timeLeft/1000)}s, iniciando atualização em background`);
        this._updateInBackground(league);
      }
      
      return cachedData;
    }
    
    // PRIORIDADE 2: Cache expirado
    const expiredCache = cacheService.get<IMatch[]>(cacheKey, true);
    if (expiredCache && Array.isArray(expiredCache) && expiredCache.length > 0) {
      console.log(`🔄 Usando dados de cache expirado com ${expiredCache.length} itens para ${league}`);
      
      // Sempre atualizar em background quando usamos cache expirado
      // Para ligas prioritárias, usar alta prioridade
      this._updateInBackground(league, isPriorityLeague);
      
      return expiredCache;
    }
    
    // PRIORIDADE 3: Requisição pendente
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🔄 Reaproveitando requisição em andamento para ${league}`);
      try {
        return await this.pendingRequests.get(cacheKey)!;
      } catch (error) {
        console.log(`⚠️ Requisição pendente para ${league} falhou`);
        // Prosseguir para a requisição à API
      }
    }
    
    // PRIORIDADE 4: Requisição à API, armazenada para reuso
    try {
      // Criar e armazenar uma nova Promise para esta requisição
      const requestPromise = this._fetchMatchesWithFallback(league, result);
      this.pendingRequests.set(cacheKey, requestPromise);
      
      // Configurar limpeza automática da referência quando concluída
      requestPromise.finally(() => {
        if (this.pendingRequests.get(cacheKey) === requestPromise) {
          this.pendingRequests.delete(cacheKey);
        }
      });
      
      // Executar a requisição em background sem bloquear
      requestPromise.catch(e => console.error(`Erro na requisição em background: ${e}`));
      
      // Retornar array vazio imediatamente
      return [];
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  }
  
  /**
   * Implementação interna para obter dados com estratégia de fallback
   * Usado apenas em background, não bloqueia a interface
   */
  private async _fetchMatchesWithFallback(league: string, result?: string): Promise<IMatch[]> {
    try {
      const cacheKey = `matches_${league}_480`;
      
      // Tentar obter dados via API direta
      const data = await apiService.getMatches(league, result);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Definir TTL específico por liga para garantir atualizações adequadas
        const ttl = 180000; // 3 minutos para todas as ligas
        console.log(`⏰ [${league}] Cache definido com TTL de 3 minutos`);
        
        // Salvar no cache e notificar ouvintes
        cacheService.set(cacheKey, data, ttl);
        this.lastUpdatedMap.set(league, new Date());
        this._notifyUpdateListeners(league, data, 'api');
        
        console.log(`✅ [${league}] Dados atualizados: ${data.length} itens`);
        return data;
      }
      
      throw new Error('API retornou dados vazios');
    } catch (error) {
      console.error(`❌ Erro ao obter partidas para ${league}:`, error);
      
      // Não lançar erro, apenas retornar array vazio para não bloquear
      return [];
    }
  }
  
  /**
   * Inicia uma atualização em segundo plano sem bloquear
   */
  private _updateInBackground(league: string, highPriority: boolean = true): void {
    // Executar imediatamente sem delay
    workerService.fetchDataForLeague(league, highPriority).catch(e => {
      console.warn(`Erro na atualização em background para ${league}:`, e);
    });
  }
  
  /**
   * Adiciona um ouvinte para atualizações em uma liga específica
   * @param liga - ID da liga
   * @param listener - Função de callback
   */
  addUpdateListener(liga: string, listener: CachedApiUpdateListener): void {
    if (!this.updateListeners[liga]) {
      this.updateListeners[liga] = [];
    }
    
    this.updateListeners[liga].push(listener);
    
    // Chamar imediatamente com dados do cache se disponíveis
    const cacheKey = `matches_${liga}_480`;
    const cachedData = cacheService.get<IMatch[]>(cacheKey, true);
    
    if (cachedData && cachedData.length > 0) {
      try {
        listener(cachedData, 'cache');
      } catch (error) {
        console.error(`Erro ao notificar listener inicial para ${liga}:`, error);
      }
    }
  }
  
  /**
   * Remove um ouvinte de atualizações
   * @param liga - ID da liga
   * @param listener - Função de callback a remover
   */
  removeUpdateListener(liga: string, listener: CachedApiUpdateListener): void {
    if (!this.updateListeners[liga]) return;
    
    this.updateListeners[liga] = this.updateListeners[liga].filter(l => l !== listener);
  }
  
  /**
   * Notifica todos os ouvintes sobre atualizações nos dados
   * @param liga - ID da liga
   * @param data - Dados atualizados
   * @param source - Fonte dos dados (cache ou api)
   */
  private _notifyUpdateListeners(liga: string, data: IMatch[], source: string): void {
    if (!this.updateListeners[liga]) return;
    
    this.updateListeners[liga].forEach(listener => {
      try {
        listener(data, source);
      } catch (error) {
        console.error(`Erro ao notificar ouvinte para ${liga}:`, error);
      }
    });
  }
  
  /**
   * Força uma atualização imediata dos dados de uma liga
   * @param liga - ID da liga para atualizar
   * @returns Promise que resolve quando a atualização for concluída
   */
  async forceUpdate(liga: string): Promise<void> {
    // Implementação proativa para forçar uma nova consulta
    console.log(`Forçando atualização de dados para ${liga}...`);
    
    try {
      // Remover do cache para forçar nova requisição
      cacheService.delete(`matches_${liga}_480`);
      
      // Invalidar também qualquer requisição pendente
      this.pendingRequests.delete(`matches_${liga}_480`);
      
      // Buscar novos dados
      await this.getMatches(liga);
      
      console.log(`Dados para ${liga} atualizados com sucesso.`);
    } catch (error) {
      console.error(`Erro ao forçar atualização para ${liga}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtém a última data de atualização para uma liga
   * @param liga - ID da liga
   * @returns Data da última atualização ou null se não disponível
   */
  getLastUpdated(liga: string): Date | null {
    return this.lastUpdatedMap.get(liga) || null;
  }
  
  /**
   * Limpa recursos e para os workers quando o serviço for desmontado
   */
  cleanup(): void {
    if (!this.isInitialized) return;
    
    workerService.cleanup();
    this.updateListeners = {};
    this.isInitialized = false;
    this.lastUpdatedMap.clear();
    this.pendingRequests.clear();
    
    console.log('CachedApiService finalizado com sucesso.');
  }
}

// Exporta instância única para uso em toda a aplicação
export const cachedApiService = new CachedApiService(); 