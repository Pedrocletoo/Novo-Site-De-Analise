import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Estilos do componente
const MonitorContainer = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  width: 300px;
  z-index: 1000;
  font-family: monospace;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
`;

const MetricLabel = styled.span`
  color: #8bc34a;
`;

const MetricValue = styled.span`
  color: #ff9800;
`;

const Title = styled.div`
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #2196f3;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 10px;
  right: 320px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  z-index: 1000;
  
  &:hover {
    background-color: #1976d2;
  }
`;

// Interface para os dados de performance
interface PerformanceData {
  apiRequestTime: number[];
  renderTime: number[];
  totalUpdateTime: number[];
  updatesCount: {
    api: number;
    total: number;
  };
  lastUpdateSource: string;
  lastUpdateTime: Date | null;
}

// Função para calcular a média de um array de números
const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Componente para monitorar e exibir métricas de performance
 */
const PerformanceMonitor: React.FC = () => {
  // Estado para armazenar os dados de performance
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    apiRequestTime: [],
    renderTime: [],
    totalUpdateTime: [],
    updatesCount: {
      api: 0,
      total: 0
    },
    lastUpdateSource: '',
    lastUpdateTime: null
  });
  
  // Estado para controlar a visibilidade do monitor
  const [isVisible, setIsVisible] = useState(true);
  
  // Efeito para interceptar console.logs relacionados à performance
  useEffect(() => {
    // Armazenar referência ao console.log original
    const originalConsoleLog = console.log;
    
    // Variáveis para cálculo do tempo total
    let requestStartTime = 0;
    let renderEndTime = 0;
    
    // Interceptar chamadas ao console.log
    console.log = function(...args) {
      // Chamar o console.log original
      originalConsoleLog.apply(console, args);
      
      // Verificar se a mensagem contém informações de performance
      if (typeof args[0] === 'string') {
        const logMessage = args[0];
        
        // Capturar tempo de solicitação da API
        if (logMessage.includes('Solicitando atualização de dados')) {
          requestStartTime = performance.now();
        }
        
        // Contar atualizações via API
        if (logMessage.includes('RESULTADO ATUALIZADO:')) {
          setPerformanceData(prev => ({
            ...prev,
            updatesCount: {
              ...prev.updatesCount,
              api: prev.updatesCount.api + 1,
              total: prev.updatesCount.total + 1
            },
            lastUpdateSource: 'API',
            lastUpdateTime: new Date()
          }));
        }
        
        // Capturar tempo de resposta da API
        if (logMessage.includes('Tempo total da requisição API')) {
          const timeMatch = /(\d+\.\d+)ms/.exec(args[1] || args[0]);
          if (timeMatch && timeMatch[1]) {
            setPerformanceData(prev => ({
              ...prev,
              apiRequestTime: [...prev.apiRequestTime, parseFloat(timeMatch[1])].slice(-10),
              updatesCount: {
                ...prev.updatesCount,
                api: prev.updatesCount.api + 1,
                total: prev.updatesCount.total + 1
              },
              lastUpdateSource: 'API',
              lastUpdateTime: new Date()
            }));
          }
        }
        
        // Capturar tempo de renderização
        if (logMessage.includes('Tempo de renderização da tabela')) {
          const timeMatch = /(\d+\.\d+)ms/.exec(args[0]);
          if (timeMatch && timeMatch[1]) {
            setPerformanceData(prev => ({
              ...prev,
              renderTime: [...prev.renderTime, parseFloat(timeMatch[1])].slice(-10)
            }));
            
            renderEndTime = performance.now();
            
            // Calcular tempo total desde a solicitação até a renderização
            if (requestStartTime > 0) {
              const totalTime = renderEndTime - requestStartTime;
              setPerformanceData(prev => ({
                ...prev,
                totalUpdateTime: [...prev.totalUpdateTime, totalTime].slice(-10)
              }));
              
              // Resetar variáveis
              requestStartTime = 0;
              renderEndTime = 0;
            }
          }
        }
      }
    };
    
    // Restaurar console.log original na limpeza
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
  // Formata a hora da última atualização
  const formatLastUpdateTime = () => {
    if (!performanceData.lastUpdateTime) return 'N/A';
    
    return performanceData.lastUpdateTime.toLocaleTimeString();
  };
  
  if (!isVisible) {
    return (
      <ToggleButton onClick={() => setIsVisible(true)}>
        Mostrar Monitor
      </ToggleButton>
    );
  }
  
  return (
    <>
      <ToggleButton onClick={() => setIsVisible(false)}>
        Ocultar Monitor
      </ToggleButton>
      
      <MonitorContainer>
        <Title>Monitor de Performance</Title>
        
        <MetricRow>
          <MetricLabel>Tempo médio de requisição API:</MetricLabel>
          <MetricValue>
            {average(performanceData.apiRequestTime).toFixed(2)} ms
          </MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Tempo médio de renderização:</MetricLabel>
          <MetricValue>
            {average(performanceData.renderTime).toFixed(2)} ms
          </MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Tempo médio total da atualização:</MetricLabel>
          <MetricValue>
            {average(performanceData.totalUpdateTime).toFixed(2)} ms
          </MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Total de atualizações:</MetricLabel>
          <MetricValue>{performanceData.updatesCount.total}</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Via API:</MetricLabel>
          <MetricValue>{performanceData.updatesCount.api}</MetricValue>
        </MetricRow>
        
        <MetricRow>
          <MetricLabel>Última atualização:</MetricLabel>
          <MetricValue>{formatLastUpdateTime()}</MetricValue>
        </MetricRow>
      </MonitorContainer>
    </>
  );
};

export default PerformanceMonitor; 