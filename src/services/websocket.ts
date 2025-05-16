import { EventEmitter } from 'events';

// Tipos e interfaces para o WebSocket
export type WebSocketEvent = 'connected' | 'disconnected' | 'message' | 'error';
export type WebSocketMessageType = 'match_update' | 'initial_data' | 'error' | 'auth_success' | 'ping' | 'pong';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
}

// Configurações do serviço
const WS_CONFIG = {
  BASE_URL: 'wss://easy-api-betano-fv.u6y5np.easypanel.host/ws',
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 30000,
};

/**
 * Gerenciador de conexão WebSocket com reconexão automática
 * e manipulação de eventos padronizada
 */
class WebSocketService extends EventEmitter {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private subscriptions: Set<string> = new Set();

  constructor() {
    super();
    // Limitar o número máximo de ouvintes para evitar vazamentos de memória
    this.setMaxListeners(20);
  }

  /**
   * Conecta ao servidor WebSocket
   * @param authToken Token opcional para autenticação
   */
  public connect(authToken?: string): void {
    if (this.isConnected() || this.isConnecting) {
      console.log('WebSocket já conectado ou conectando');
      return;
    }

    this.isConnecting = true;
    const url = authToken 
      ? `${WS_CONFIG.BASE_URL}?token=${authToken}` 
      : WS_CONFIG.BASE_URL;

    try {
      console.log(`Conectando ao WebSocket: ${url}`);
      this.socket = new WebSocket(url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
      this.handleReconnect();
    }
  }

  /**
   * Verifica se o WebSocket está conectado
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Verifica se o WebSocket está em processo de conexão
   */
  public isConnectingNow(): boolean {
    return this.isConnecting;
  }

  /**
   * Obtém o estado atual do WebSocket
   */
  public getState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnected()) {
      return 'connected';
    }
    
    if (this.isConnecting) {
      return 'connecting';
    }
    
    return 'disconnected';
  }

  /**
   * Desconecta do servidor WebSocket
   */
  public disconnect(): void {
    this.clearTimers();
    
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.subscriptions.clear();
    this.emit('disconnected');
  }

  /**
   * Envia mensagem para o servidor
   * @param type Tipo da mensagem
   * @param payload Dados da mensagem
   */
  public send<T>(type: string, payload: T): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Tentativa de envio com WebSocket fechado');
      return false;
    }

    try {
      const message = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      });
      
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  /**
   * Assina um canal específico (ex: liga específica)
   * @param channel Nome do canal
   */
  public subscribe(channel: string): void {
    if (this.subscriptions.has(channel)) {
      return;
    }
    
    this.subscriptions.add(channel);
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send('subscribe', { channel });
    }
  }

  /**
   * Cancela assinatura de um canal
   * @param channel Nome do canal
   */
  public unsubscribe(channel: string): void {
    if (!this.subscriptions.has(channel)) {
      return;
    }
    
    this.subscriptions.delete(channel);
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send('unsubscribe', { channel });
    }
  }

  private handleOpen(): void {
    console.log('WebSocket conectado');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connected');
    
    // Resubscribe a todos os canais
    this.subscriptions.forEach(channel => {
      this.send('subscribe', { channel });
    });
    
    // Configurar ping regular para manter a conexão ativa
    this.setupPing();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      if (message.type === 'auth_success') {
        this.isAuthenticated = true;
      }
      
      this.emit('message', message);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  private handleError(event: Event): void {
    console.error('Erro no WebSocket:', event);
    this.emit('error', event);
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket fechado: ${event.code} ${event.reason}`);
    this.clearTimers();
    this.emit('disconnected');
    
    // Reconectar automaticamente se não for um fechamento intencional
    if (event.code !== 1000) {
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error('Número máximo de tentativas de reconexão excedido');
      this.emit('error', new Error('Falha na reconexão após múltiplas tentativas'));
      return;
    }
    
    const delay = this.reconnectAttempts * WS_CONFIG.RECONNECT_DELAY;
    console.log(`Tentando reconexão em ${delay}ms (tentativa ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setupPing(): void {
    this.clearTimers();
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send('ping', { time: Date.now() });
      }
    }, WS_CONFIG.PING_INTERVAL);
  }

  private clearTimers(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// Exporta instância única do serviço
export const websocketService = new WebSocketService(); 