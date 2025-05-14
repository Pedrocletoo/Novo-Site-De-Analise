import { useState, useEffect, useCallback } from 'react';
import { apiService, IMatch } from '../services/api';

interface MatchDataHookReturn {
  matches: IMatch[];
  loading: boolean;
  error: Error | null;
  refetch: (liga?: string, result?: string) => Promise<void>;
}

/**
 * Hook personalizado para gerenciar dados de partidas da API
 * 
 * @param initialLiga - Liga inicial para buscar (padrão: 'euro')
 * @param initialResult - Parâmetro result inicial (padrão: '480')
 * @returns Objeto com dados das partidas, estado de carregamento, erro e função para atualizar
 */
export function useMatchData(
  initialLiga: string = 'euro',
  initialResult: string = '480'
): MatchDataHookReturn {
  // Estados do hook
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState({
    liga: initialLiga,
    result: initialResult
  });

  // Função para buscar dados (memoizada com useCallback)
  const fetchData = useCallback(async (liga: string, result: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getMatches(liga, result);
      setMatches(data);
      return data;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados');
      setError(fetchError);
      
      // Retorna array vazio em caso de erro para evitar falhas em componentes consumidores
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função pública para permitir recarregar os dados sob demanda
  const refetch = useCallback(async (liga?: string, result?: string) => {
    // Atualiza parâmetros se forem passados
    const newLiga = liga || params.liga;
    const newResult = result || params.result;
    
    if (liga || result) {
      setParams({
        liga: newLiga,
        result: newResult
      });
    }
    
    await fetchData(newLiga, newResult);
  }, [fetchData, params.liga, params.result]);

  // Efeito para buscar dados na montagem do componente e quando parâmetros mudarem
  useEffect(() => {
    fetchData(params.liga, params.result);
  }, [fetchData, params.liga, params.result]);

  return {
    matches,
    loading,
    error,
    refetch
  };
}

/**
 * Extrai informações de tempo de uma partida
 * 
 * @param match - Objeto da partida
 * @returns Objeto com hora e minuto formatados
 */
export function useMatchTime(match: IMatch | undefined) {
  if (!match) {
    return { hour: 0, minute: 0, formatted: '00:00' };
  }
  
  const { hour, minute } = apiService.extractTimeFromMatch(match.StartTime);
  
  // Formata para exibição com padding de zeros
  const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  return { hour, minute, formatted };
}

/**
 * Extrai informações de placar de uma partida
 * 
 * @param match - Objeto da partida
 * @returns Objeto com placares estruturados ou valores padrão se não disponível
 */
export function useMatchScore(match: IMatch | undefined) {
  if (!match) {
    return {
      fullTime: { home: 0, away: 0, formatted: '0-0' },
      halfTime: { home: 0, away: 0, formatted: '0-0' }
    };
  }
  
  const scores = apiService.getMatchScore(match);
  
  return {
    fullTime: {
      ...scores.fullTime,
      formatted: `${scores.fullTime.home}-${scores.fullTime.away}`
    },
    halfTime: {
      ...scores.halfTime,
      formatted: `${scores.halfTime.home}-${scores.halfTime.away}`
    }
  };
} 