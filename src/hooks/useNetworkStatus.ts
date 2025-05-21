import { useState, useEffect } from 'react';

/**
 * Hook para monitorar o status da conexão de rede do usuário
 * 
 * @returns booleano indicando se o navegador detecta conexão com a internet
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true
  );

  useEffect(() => {
    // Função para atualizar o status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Registrar listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Verificar status atual
    updateOnlineStatus();

    // Limpar listeners na desmontagem
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
} 