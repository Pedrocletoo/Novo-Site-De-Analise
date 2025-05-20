/**
 * Worker Service - Responsável por buscar dados da API em segundo plano
 * e armazená-los no cache centralizado para acesso instantâneo pelos usuários
 */

import { IMatch } from './api';
import { cacheService, CACHE_CONFIG } from './cacheService';

// Configurações para o worker
export const WORKER_CONFIG = {
  POLLING_INTERVALS: {
    'euro': 2000,               // 2 segundos para Euro League (reduzido para atualizações mais frequentes)
    'campeonato-italiano': 2000, // 2 segundos para Campeonato Italiano
    'taca-gloria-eterna': 2000,  // 2 segundos para Taça Glória Eterna
    'default': 5000              // 5 segundos para outras ligas
  },
  API_BASE_URL: 'https://easy-api-betano-fv.u6y5np.easypanel.host',
  API_TIMEOUT: 10000, // 10 segundos de timeout (aumentado)
  MAX_CONSECUTIVE_ERRORS: 8, // Aumentado limite de erros antes de bloquear
  BLOCK_DURATION: 30000, // Reduzido para 30 segundos (era 2 minutos)
  RETRY_BACKOFF: [500, 1000, 2000], // Tempos de espera entre tentativas
};

// Lista de leagues disponíveis
const AVAILABLE_LEAGUES = [
  { id: 'euro', name: 'Euro League' },
  { id: 'campeonato-italiano', name: 'Campeonato Italiano' },
  { id: 'taca-gloria-eterna', name: 'Taça Glória Eterna' }
];

/**
 * Classe WorkerService - Gerencia os workers que coletam dados em segundo plano
 */
class WorkerService {
  private workers: Record<string, { 
    timer: NodeJS.Timeout | null; 
    isRunning: boolean;
    lastRun: Date | null;
    errorCount: number;
  }> = {};
  private isInitialized = false;
  private workerQueue: {
    league: string;
    workerId: string;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
    retryCount: number;
    timestamp: number;
  }[] = [];
  private isWorkerRunning = false;
  private errorCounts: Record<string, number> = {};
  private leagueBlocks: Record<string, number> = {};
  
  /**
   * Inicializa o serviço de background workers
   */
  initialize(): void {
    if (this.isInitialized) {
      console.log('WorkerService já inicializado.');
      return;
    }
    
    console.log('Inicializando WorkerService...');
    
    // Inicializar workers para todas as ligas disponíveis
    AVAILABLE_LEAGUES.forEach(league => {
      this.startWorker(league.id);
    });
    
    this.isInitialized = true;
    console.log('WorkerService inicializado com sucesso.');
  }
  
  /**
   * Inicia um worker para uma liga específica
   * @param leagueId - ID da liga
   */
  startWorker(leagueId: string): void {
    // Verificar se já estamos executando este worker
    const alreadyRunning = this.workers[leagueId] && this.workers[leagueId].isRunning;
    
    if (alreadyRunning) {
      console.log(`Worker para ${leagueId} já está em execução.`);
      return;
    }
    
    console.log(`Iniciando worker para ${leagueId}...`);
    
    // Inicializar dados do worker
    this.workers[leagueId] = {
      timer: null,
      isRunning: true,
      lastRun: null,
      errorCount: 0
    };
    
    // Executar imediatamente a primeira vez, com alta prioridade
    Promise.resolve().then(() => {
      return this.fetchDataForLeague(leagueId, true);
    }).then(() => {
      console.log(`✅ Worker para ${leagueId}: primeira execução bem-sucedida`);
    }).catch(error => {
      console.error(`❌ Worker para ${leagueId}: erro na primeira execução:`, error);
      if (this.workers[leagueId]) {
        this.workers[leagueId].errorCount++;
      }
      
      // Tentar novamente imediatamente uma vez se falhar
      setTimeout(() => {
        if (this.workers[leagueId] && this.workers[leagueId].isRunning) {
          console.log(`⏳ Worker para ${leagueId}: tentando novamente após falha inicial...`);
          this.fetchDataForLeague(leagueId, true).catch(err => {
            console.error(`❌ Worker para ${leagueId}: falha na segunda tentativa:`, err);
            if (this.workers[leagueId]) {
              this.workers[leagueId].errorCount++;
            }
          });
        }
      }, 500);
    });
    
    // Configurar timer para execuções periódicas APÓS a primeira execução
    const interval = WORKER_CONFIG.POLLING_INTERVALS[leagueId] || WORKER_CONFIG.POLLING_INTERVALS.default;
    
    this.workers[leagueId].timer = setInterval(() => {
      if (!this.workers[leagueId] || !this.workers[leagueId].isRunning) return;
      
      this.fetchDataForLeague(leagueId, false)
        .then(() => {
          if (this.workers[leagueId]) {
            this.workers[leagueId].errorCount = 0; // Resetar contador de erros em caso de sucesso
          }
        })
        .catch(error => {
          console.error(`Erro ao buscar dados para ${leagueId}:`, error);
          if (this.workers[leagueId]) {
            this.workers[leagueId].errorCount++;
            
            // Se houver muitos erros consecutivos, aumentar o intervalo temporariamente
            if (this.workers[leagueId].errorCount > 3) {
              this.pauseWorker(leagueId);
              console.log(`Worker para ${leagueId} pausado temporariamente devido a erros consecutivos.`);
              
              // Tentar reiniciar após 20 segundos
              setTimeout(() => {
                console.log(`Tentando reiniciar worker para ${leagueId} após pausa...`);
                this.restartWorker(leagueId);
              }, 20000);
            }
          }
        });
    }, interval);
    
    console.log(`Worker para ${leagueId} iniciado com intervalo de ${interval}ms.`);
  }
  
  /**
   * Busca dados da API para uma liga específica e armazena no cache
   * @param leagueId - ID da liga
   * @param highPriority - Se true, executa com prioridade alta
   * @returns Promise que resolve quando os dados são obtidos
   */
  async fetchDataForLeague(leagueId: string, highPriority: boolean = false): Promise<void> {
    // Identificador único para esta solicitação
    const workerId = `worker_${leagueId}_${Date.now()}`;
    
    // Registrar início do worker
    console.log(`🚀 Iniciando worker ${workerId} para ${leagueId}...`);
    
    // Se for alta prioridade, executar imediatamente em vez de agendar
    if (highPriority) {
      console.log(`⚡ Worker de alta prioridade para ${leagueId} - executando imediatamente`);
      try {
        return await this.executeWorker(leagueId, workerId);
      } catch (error) {
        console.error(`❌ Worker de alta prioridade falhou para ${leagueId}:`, error);
        throw error;
      }
    }
    
    // Caso contrário, agendar na fila
    return new Promise((resolve, reject) => {
      // Adicionar à fila com prioridade normal
      this.workerQueue.push({
        league: leagueId,
        workerId,
        resolve,
        reject,
        retryCount: 0,
        timestamp: Date.now()
      });
      
      // Se for a primeira tarefa e o worker não estiver em execução, iniciar
      if (this.workerQueue.length === 1 && !this.isWorkerRunning) {
        this.processNextInQueue();
      } else {
        console.log(`⏳ Worker para ${leagueId} adicionado à fila (${this.workerQueue.length} itens)`);
      }
    });
  }
  
  /**
   * Processa o próximo item na fila de workers
   */
  private processNextInQueue(): void {
    if (this.workerQueue.length === 0) {
      this.isWorkerRunning = false;
      return;
    }
    
    this.isWorkerRunning = true;
    
    // Ordenar fila por tempo de espera (priorizar itens mais antigos)
    this.workerQueue.sort((a, b) => a.timestamp - b.timestamp);
    
    const nextTask = this.workerQueue.shift();
    
    if (!nextTask) {
      this.isWorkerRunning = false;
      return;
    }
    
    const { league, workerId, resolve, reject, retryCount } = nextTask;
    
    // Verificar se a liga está bloqueada por muitos erros
    if (this.leagueBlocks[league] && Date.now() < this.leagueBlocks[league]) {
      console.log(`⏳ Liga ${league} bloqueada por erros, tentando usar cache...`);
      
      // Tentar usar dados do cache mesmo que expirados
      const cacheKey = `matches_${league}_480`;
      const cachedData = cacheService.get<IMatch[]>(cacheKey, true);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`🔄 Usando dados do cache para ${league} enquanto liga está bloqueada`);
        // Se tivermos dados no cache, consideramos como sucesso e reduzimos o bloqueio
        this.leagueBlocks[league] = Math.min(
          this.leagueBlocks[league],
          Date.now() + 10000 // Reduzir bloqueio para 10 segundos se temos cache
        );
        resolve(); // Resolver com sucesso usando dados do cache
      } else {
        // Sem dados de cache disponíveis, reduzir o tempo de bloqueio
        const remainingTime = Math.round((this.leagueBlocks[league] - Date.now()) / 1000);
        console.log(`⚠️ Sem dados de cache para ${league}, bloqueada por mais ${remainingTime}s`);
        reject(new Error(`Liga ${league} bloqueada temporariamente`));
      }
      
      // Processar o próximo imediatamente
      setTimeout(() => this.processNextInQueue(), 0);
      return;
    }
    
    // Executar o worker
    this.executeWorker(league, workerId)
      .then(() => {
        // Sucesso - resolver a promise
        resolve();
        
        // Processar o próximo após um pequeno intervalo
        setTimeout(() => this.processNextInQueue(), 50);
      })
      .catch((error) => {
        // Verificar se devemos tentar novamente
        if (retryCount < 3) { // Aumentado para 3 tentativas
          console.log(`⏳ Tentando novamente worker para ${league} (tentativa ${retryCount + 1}/4)`);
          
          // Definir backoff exponencial para retentativas
          const backoffTimes = WORKER_CONFIG.RETRY_BACKOFF;
          const backoffTime = backoffTimes[retryCount] || 2000;
          
          // Reinserir na fila com contagem de retry incrementada
          this.workerQueue.unshift({
            ...nextTask,
            retryCount: retryCount + 1,
            timestamp: Date.now() - 5000 // Prioridade mais alta para retentativas
          });
          
          // Tentar novamente após pausa progressiva
          setTimeout(() => this.processNextInQueue(), backoffTime);
        } else {
          // Falha após todas as tentativas
          console.error(`❌ Worker falhou após ${retryCount + 1} tentativas para ${league}`);
          
          // Tentar usar dados do cache mesmo que expirados
          const cacheKey = `matches_${league}_480`;
          const cachedData = cacheService.get<IMatch[]>(cacheKey, true);
          
          if (cachedData && cachedData.length > 0) {
            console.log(`🔄 Fallback: usando dados do cache após falhas para ${league}`);
            resolve(); // Resolver com sucesso usando dados do cache
          } else {
            reject(error);
          }
          
          // Continuar processando a fila
          setTimeout(() => this.processNextInQueue(), 100);
        }
      });
  }
  
  /**
   * Executa a lógica principal do worker
   * @param league A liga a buscar
   * @param workerId ID único deste worker
   */
  private async executeWorker(league: string, workerId: string): Promise<void> {
    const cacheKey = `matches_${league}_480`;
    
    try {
      console.log(`🔄 Worker ${workerId} buscando dados para ${league}...`);
      
      // Usar AbortController para evitar operações pendentes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WORKER_CONFIG.API_TIMEOUT);
      
      // Fazer requisição à API
      const response = await fetch(
        `${WORKER_CONFIG.API_BASE_URL}/api.php?liga=${league}&result=480`,
        { signal: controller.signal }
      );
      
      // Limpar o timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API respondeu com status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validar formato de dados
      if (!Array.isArray(data)) {
        throw new Error(`Formato inválido de dados para ${league}`);
      }
      
      if (data.length === 0) {
        console.warn(`⚠️ Worker ${workerId}: API retornou array vazio para ${league}`);
      } else {
        console.log(`✅ Worker ${workerId}: ${data.length} itens obtidos para ${league}`);
        
        // Armazenar no cache com TTL prolongado
        cacheService.set(cacheKey, data, 480000); // 8 minutos
        
        // Atualizar timestamp
        cacheService.set(`lastUpdate_${league}`, {
          timestamp: Date.now(),
          count: data.length
        });
      }
      
      // Redefinir contagem de erros
      this.errorCounts[league] = 0;
      
      // Desbloquear a liga se estava bloqueada
      if (this.leagueBlocks[league]) {
        delete this.leagueBlocks[league];
        console.log(`✅ Liga ${league} desbloqueada após sucesso`);
      }
      
      return;
    } catch (error) {
      // Incrementar contador de erros para este league
      this.errorCounts[league] = (this.errorCounts[league] || 0) + 1;
      
      console.error(`❌ Worker ${workerId} falhou para ${league} (erro #${this.errorCounts[league]}):`, error);
      
      // Se tivermos mais erros consecutivos que o limite, impedir novas tentativas por um tempo
      if (this.errorCounts[league] > WORKER_CONFIG.MAX_CONSECUTIVE_ERRORS) {
        console.warn(`⛔ Muitos erros consecutivos para ${league}, pausando novas tentativas por 30 segundos`);
        
        // Definir um bloqueio temporário
        this.leagueBlocks[league] = Date.now() + WORKER_CONFIG.BLOCK_DURATION;
        
        // Tentar usar dados expirados do cache como fallback
        const cachedData = cacheService.get<IMatch[]>(cacheKey, true);
        if (cachedData && cachedData.length > 0) {
          console.log(`🔁 Usando dados expirados como fallback para ${league}`);
          return;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Pausa um worker específico
   * @param leagueId - ID da liga
   */
  pauseWorker(leagueId: string): void {
    if (!this.workers[leagueId]) return;
    
    this.workers[leagueId].isRunning = false;
    
    if (this.workers[leagueId].timer) {
      clearInterval(this.workers[leagueId].timer as NodeJS.Timeout);
      this.workers[leagueId].timer = null;
    }
    
    console.log(`Worker para ${leagueId} pausado.`);
  }
  
  /**
   * Reinicia um worker específico
   * @param leagueId - ID da liga
   */
  restartWorker(leagueId: string): void {
    this.pauseWorker(leagueId);
    this.workers[leagueId].errorCount = 0;
    this.startWorker(leagueId);
  }
  
  /**
   * Pausa todos os workers
   */
  pauseAll(): void {
    console.log('Pausando todos os workers...');
    
    Object.keys(this.workers).forEach(leagueId => {
      this.pauseWorker(leagueId);
    });
  }
  
  /**
   * Reinicia todos os workers
   */
  restartAll(): void {
    console.log('Reiniciando todos os workers...');
    
    Object.keys(this.workers).forEach(leagueId => {
      this.restartWorker(leagueId);
    });
  }
  
  /**
   * Obtém status de todos os workers
   */
  getStatus(): Record<string, {
    isRunning: boolean;
    lastRun: Date | null;
    errorCount: number;
  }> {
    const status: Record<string, any> = {};
    
    Object.keys(this.workers).forEach(leagueId => {
      status[leagueId] = {
        isRunning: this.workers[leagueId].isRunning,
        lastRun: this.workers[leagueId].lastRun,
        errorCount: this.workers[leagueId].errorCount
      };
    });
    
    return status;
  }
  
  /**
   * Limpa todos os recursos ao desmontar o serviço
   */
  cleanup(): void {
    console.log('Limpando WorkerService...');
    
    Object.keys(this.workers).forEach(leagueId => {
      if (this.workers[leagueId].timer) {
        clearInterval(this.workers[leagueId].timer as NodeJS.Timeout);
        this.workers[leagueId].timer = null;
      }
    });
    
    this.workers = {};
    this.isInitialized = false;
  }
}

// Exporta instância única para uso em toda a aplicação
export const workerService = new WorkerService(); 