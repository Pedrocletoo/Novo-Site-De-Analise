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
    
    // Verificar se já existe uma requisição em andamento para esta liga
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🔄 Reaproveitando requisição em andamento para ${league}`);
      try {
        return await this.pendingRequests.get(cacheKey)!;
      } catch (error) {
        // Se a requisição pendente falhar, continuamos com uma nova tentativa
        console.log(`⚠️ Requisição pendente para ${league} falhou, tentando novamente`);
        this.pendingRequests.delete(cacheKey);
      }
    }
    
    // Criar e armazenar uma nova Promise para este request
    const requestPromise = this._fetchMatchesWithFallback(league, result);
    this.pendingRequests.set(cacheKey, requestPromise);
    
    // Configurar limpeza automática da referência quando concluída
    requestPromise.finally(() => {
      if (this.pendingRequests.get(cacheKey) === requestPromise) {
        this.pendingRequests.delete(cacheKey);
      }
    });
    
    return requestPromise;
  }
  
  /**
   * Implementação interna para obter dados com estratégia de fallback
   */
  private async _fetchMatchesWithFallback(league: string, result?: string): Promise<IMatch[]> {
    try {
      const cacheKey = `matches_${league}_480`;
      
      // ESTRATÉGIA 1: Cache - resposta imediata
      const cachedData = cacheService.get<IMatch[]>(cacheKey);
      
      // Se temos dados em cache válidos, use-os imediatamente
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log(`🏆 Usando ${cachedData.length} partidas do cache para ${league}`);
        
        // Verificar idade do cache e atualizar em background se necessário
        const timeLeft = cacheService.getTimeToLive(cacheKey);
        if (timeLeft < 120000) { // Se faltam menos de 2 minutos para expirar
          console.log(`⏱️ Cache expirando em ${Math.round(timeLeft/1000)}s, iniciando atualização em background`);
          this._updateInBackground(league);
        }
        
        return cachedData;
      }
      
      // ESTRATÉGIA 2: Tentar busca direta com tempo limite baixo (fast fail)
      console.log(`🔍 Buscando dados para ${league} (sem cache disponível)`);
      
      // Tentar buscar dados via worker com timeout curto para resposta rápida
      try {
        const workerPromise = workerService.fetchDataForLeague(league, true);
        
        // Esperar no máximo 1.5 segundos pelo worker (timeout agressivo)
        const quickTimeoutPromise = new Promise<IMatch[]>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout rápido excedido')), 1500);
        });
        
        // Tentar buscar dados do worker com timeout
        const workerData = await Promise.race([
          workerPromise,
          quickTimeoutPromise
        ]);
        
        // Se tivermos dados do worker, retorná-los
        const freshCachedData = cacheService.get<IMatch[]>(cacheKey);
        if (freshCachedData && freshCachedData.length > 0) {
          console.log(`✅ Dados obtidos rapidamente para ${league}`);
          return freshCachedData;
        }
      } catch (fastTimeoutError) {
        console.log(`⏱️ Timeout rápido para ${league}, tentando API direta`);
      }
      
      // ESTRATÉGIA 3: API direta como fallback
      console.log(`⚡ Tentando API direta para ${league}`);
      
      // Iniciar worker em background para próximas solicitações
      this._updateInBackground(league);
      
      // Tentar API direta com timeout
      try {
        const directApiPromise = apiService.getMatches(league, result);
        const apiTimeoutPromise = new Promise<IMatch[]>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout da API excedido')), 4000);
        });
        
        // Obter dados da API com timeout
        const apiData = await Promise.race([directApiPromise, apiTimeoutPromise]);
        
        if (apiData && apiData.length > 0) {
          console.log(`✅ Obtidos ${apiData.length} itens da API direta para ${league}`);
          
          // Salvar no cache
          cacheService.set(cacheKey, apiData, 480000); // 8 minutos
          this.lastUpdatedMap.set(league, new Date());
          
          // Notificar listeners
          this._notifyUpdateListeners(league, apiData, 'api');
          
          return apiData;
        }
      } catch (apiError) {
        console.error(`❌ Erro na API direta para ${league}:`, apiError);
      }
      
      // ESTRATÉGIA 4: Cache expirado como último recurso
      console.log(`🔄 Tentando cache expirado para ${league} como último recurso`);
      const expiredCache = cacheService.get<IMatch[]>(cacheKey, true);
      
      if (expiredCache && expiredCache.length > 0) {
        console.log(`🔄 Usando dados de cache expirado com ${expiredCache.length} itens para ${league}`);
        return expiredCache;
      }
      
      // FALHA TOTAL: Se chegou aqui, não conseguimos dados de nenhuma fonte
      throw new Error(`Não foi possível obter dados para ${league} de nenhuma fonte`);
      
    } catch (error) {
      console.error(`❌ Erro ao obter partidas para ${league}:`, error);
      
      // Último recurso: tentar dados expirados
      const cachedData = cacheService.get<IMatch[]>(`matches_${league}_480`, true);
      if (cachedData && cachedData.length > 0) {
        console.log(`⚠️ FALLBACK FINAL: Usando dados de cache expirado para ${league}`);
        return cachedData;
      }
      
      // Se não temos absolutamente nada, retornar array vazio em vez de erro
      // para evitar bloqueios na interface
      console.error(`⛔ ERRO CRÍTICO: Sem dados para ${league}, retornando array vazio`);
      return [];
    }
  }
  
  /**
   * Inicia uma atualização em segundo plano sem bloquear
   */
  private _updateInBackground(league: string): void {
    setTimeout(() => {
      workerService.fetchDataForLeague(league, true).catch(e => {
        console.warn(`Erro na atualização em background para ${league}:`, e);
      });
    }, 100);
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