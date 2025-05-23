/**
 * Hook useProcessedTableData - Fornece dados processados para tabelas
 * 
 * Este hook otimiza o desempenho de renderização de tabelas:
 * 1. Busca dados da API através do hook useMatchData existente
 * 2. Processa os dados uma única vez usando o tableProcessingService
 * 3. Mantém os resultados em cache para evitar reprocessamento
 * 4. Permite atualizações em background sem interromper a visualização
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMatchData } from './useMatchData';
import { tableProcessingService, ProcessedTableData } from '../services/tableProcessingService';
import { useFilterContext } from '../components/Filters';
import { useTimeFilter } from '../components/Filters/common/TimeFilter';

interface UseProcessedTableDataReturn {
  processedData: ProcessedTableData | null;
  loading: boolean;
  error: Error | null;
  isBackgroundRefreshing: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

/**
 * Hook principal para processamento de dados de tabelas
 * 
 * @param initialLiga - Liga inicial para buscar dados
 * @param initialResult - Número de resultados a buscar
 * @returns Dados processados e estado do processamento
 */
export function useProcessedTableData(
  initialLiga?: string,
  initialResult: string = '480'
): UseProcessedTableDataReturn {
  // Obter dados da API usando o hook existente
  const { liga: filterLiga, hoursFilter } = useFilterContext();
  const { timeFilter } = useTimeFilter();
  
  // Determinar a liga efetiva (do filtro ou do parâmetro)
  const effectiveLiga = initialLiga || filterLiga || 'euro';
  
  // Buscar dados brutos da API
  const {
    matches,
    loading: apiLoading,
    error: apiError,
    lastUpdated: apiLastUpdated,
    isBackgroundRefreshing: apiRefreshing,
    refetch: refetchMatches
  } = useMatchData(effectiveLiga, initialResult);
  
  // Estados locais
  const [processedData, setProcessedData] = useState<ProcessedTableData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);
  
  // Referências para evitar processamento redundante
  const previousMatchesRef = useRef<string | null>(null);
  const previousFiltersRef = useRef<string | null>(null);
  
  /**
   * Processa os dados brutos da API em estrutura otimizada para tabelas
   */
  const processData = useCallback(() => {
    if (matches.length === 0 || isProcessing) return;
    
    // Verificar se houve mudança nos dados ou filtros para evitar processamento desnecessário
    const matchesChecksum = `${matches.length}_${apiLastUpdated?.getTime() || 0}`;
    const filtersChecksum = `${effectiveLiga}_${hoursFilter}_${timeFilter}`;
    
    if (
      matchesChecksum === previousMatchesRef.current &&
      filtersChecksum === previousFiltersRef.current &&
      processedData
    ) {
      console.log('Evitando reprocessamento de dados idênticos');
      return;
    }
    
    console.log(`Iniciando processamento de dados para ${effectiveLiga}`);
    setIsProcessing(true);
    
    try {
      // Processar dados usando o serviço
      const processed = tableProcessingService.processMatchesForTable(
        matches,
        effectiveLiga,
        hoursFilter,
        timeFilter
      );
      
      // Atualizar estado
      setProcessedData(processed);
      setLastProcessed(new Date());
      setError(null);
      
      // Atualizar checksums
      previousMatchesRef.current = matchesChecksum;
      previousFiltersRef.current = filtersChecksum;
    } catch (err) {
      console.error('Erro ao processar dados da tabela:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao processar dados'));
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  }, [matches, effectiveLiga, hoursFilter, timeFilter, apiLastUpdated, isProcessing, processedData]);
  
  // Processar dados quando matches ou filtros mudam
  useEffect(() => {
    if (matches.length > 0) {
      processData();
    }
  }, [matches, effectiveLiga, hoursFilter, timeFilter, processData]);
  
  // Passar erro da API para o estado local
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);
  
  // Atualizar estado de carregamento com base na API
  useEffect(() => {
    // Se a API está carregando pela primeira vez (sem dados), mostrar loading
    if (apiLoading && matches.length === 0) {
      setLoading(true);
    } 
    // Se a API terminou de carregar e não estamos processando, desativar loading
    else if (!apiLoading && !isProcessing) {
      setLoading(false);
    }
  }, [apiLoading, matches.length, isProcessing]);
  
  /**
   * Função para atualizar os dados manualmente
   */
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      // Primeiro limpar o cache para este conjunto de dados
      tableProcessingService.clearProcessedCache(effectiveLiga);
      
      // Então solicitar novos dados da API
      await refetchMatches();
    } catch (err) {
      console.error('Erro ao atualizar dados processados:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao atualizar dados'));
    }
  }, [effectiveLiga, refetchMatches]);
  
  return {
    processedData,
    loading: loading || apiLoading,
    error,
    isBackgroundRefreshing: apiRefreshing || isProcessing,
    lastUpdated: lastProcessed || apiLastUpdated,
    refreshData
  };
} 