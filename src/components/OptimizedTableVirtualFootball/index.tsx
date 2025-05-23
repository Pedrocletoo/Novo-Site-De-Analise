import React, { useMemo, useCallback, useState, memo } from 'react';
import { useProcessedTableData } from '../../hooks/useProcessedTableData';
import { useFilterContext } from '../Filters';
import { useTimeFilter } from '../Filters/common/TimeFilter';
import styled from 'styled-components';

// Estilos compartilhados para a tabela otimizada
const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--main-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .status-info {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-light);
  }
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 1px;
  table-layout: fixed;
`;

const TableHead = styled.thead`
  background-color: var(--secondary-background);
  
  th {
    padding: 12px 8px;
    text-align: center;
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--secondary-background);
    min-width: 40px;
  }
  
  th:first-child {
    text-align: left;
    padding-left: 16px;
    min-width: 60px;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(even) {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const HourCell = styled.td`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-right: 1px solid var(--border-color);
  white-space: nowrap;
`;

interface DataCellProps {
  isEmpty?: boolean;
  color?: string;
}

const DataCell = styled.td<DataCellProps>`
  padding: 12px 8px;
  text-align: center;
  font-weight: ${props => props.isEmpty ? 'normal' : 'bold'};
  color: ${props => props.isEmpty ? 'var(--text-light)' : 'var(--text-color)'};
  background-color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.color === 'green') return 'var(--green-cell)';
    if (props.color === 'red') return 'var(--red-cell)';
    return 'transparent';
  }};
  transition: background-color 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  color: var(--text-color);
  z-index: 100;
`;

const RefreshButton = styled.button`
  padding: 8px 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--accent-color-hover);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const UpdateIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-light);
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--accent-color);
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
`;

// Componente otimizado para células de dados (memoizado)
const MemoizedDataCell = memo(({ 
  cellData, 
  minuteStr 
}: { 
  cellData: any; 
  minuteStr: string;
}) => {
  const scoreText = cellData.isEmpty ? '-' : `${cellData.homeScore}-${cellData.awayScore}`;
  
  return (
    <DataCell 
      isEmpty={cellData.isEmpty} 
      color={cellData.color}
      data-minute={minuteStr}
    >
      {scoreText}
    </DataCell>
  );
});

// Componente para linhas da tabela (memoizado)
const MemoizedTableRow = memo(({ 
  rowData, 
  minutes 
}: { 
  rowData: any; 
  minutes: string[];
}) => {
  // Formatar a hora para exibição
  const hourDisplay = `${rowData.hourKey}:00`;
  
  return (
    <TableRow>
      <HourCell>{hourDisplay}</HourCell>
      {minutes.map(minuteStr => (
        <MemoizedDataCell 
          key={`cell-${minuteStr}`}
          cellData={rowData.cells[minuteStr] || { isEmpty: true }}
          minuteStr={minuteStr}
        />
      ))}
    </TableRow>
  );
});

/**
 * Componente de tabela otimizado para renderização rápida
 * Utiliza pré-processamento de dados e memoização para garantir performance
 */
const OptimizedTableVirtualFootball: React.FC<{
  title?: string;
  liga?: string;
}> = ({ title, liga }) => {
  // Obter dados da API com processamento otimizado
  const { liga: contextLiga } = useFilterContext();
  const { timeFilter } = useTimeFilter();
  const effectiveLiga = liga || contextLiga || 'euro';
  
  // Buscar dados processados através do hook especializado
  const {
    processedData,
    loading,
    error,
    isBackgroundRefreshing,
    lastUpdated,
    refreshData
  } = useProcessedTableData(effectiveLiga);
  
  // Estado para indicar que houve atualização recente
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false);
  
  // Definir minutos para as colunas da tabela
  const minutes = useMemo(() => {
    return ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  }, []);
  
  // Efeito para mostrar indicador de atualização
  React.useEffect(() => {
    if (processedData) {
      setShowUpdateIndicator(true);
      const timer = setTimeout(() => setShowUpdateIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [processedData]);
  
  // Função para formatar a data da última atualização
  const formattedLastUpdate = useMemo(() => {
    if (!lastUpdated) return 'Ainda não atualizado';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 10) return 'Agora mesmo';
    if (diffSec < 60) return `${diffSec} segundos atrás`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutos atrás`;
    return lastUpdated.toLocaleTimeString();
  }, [lastUpdated]);
  
  // Função para atualizar os dados manualmente
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);
  
  // Renderizar mensagem de erro se houver
  if (error && !processedData) {
    return (
      <TableWrapper>
        <TableHeader>
          <h3>{title || `Tabela ${effectiveLiga.toUpperCase()}`}</h3>
          <div className="status-info">
            <span>Erro ao carregar dados</span>
            <RefreshButton onClick={handleRefresh}>Tentar novamente</RefreshButton>
          </div>
        </TableHeader>
        <div style={{ padding: '20px', color: 'var(--text-color)' }}>
          {error.message}
        </div>
      </TableWrapper>
    );
  }
  
  return (
    <TableWrapper>
      <TableHeader>
        <h3>{title || `Tabela ${effectiveLiga.toUpperCase()}`}</h3>
        <div className="status-info">
          <span>Última atualização: {formattedLastUpdate}</span>
          {(isBackgroundRefreshing || showUpdateIndicator) && (
            <UpdateIndicator>
              <div className="dot"></div>
              Atualizando...
            </UpdateIndicator>
          )}
          <RefreshButton 
            onClick={handleRefresh}
            disabled={isBackgroundRefreshing || loading}
          >
            Atualizar
          </RefreshButton>
        </div>
      </TableHeader>
      
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <th>Hora</th>
              {minutes.map(minute => (
                <th key={`header-${minute}`}>{minute}</th>
              ))}
            </tr>
          </TableHead>
          
          <TableBody>
            {processedData?.rows.map(rowData => (
              <MemoizedTableRow 
                key={`row-${rowData.hourKey}`}
                rowData={rowData}
                minutes={minutes}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Overlay de carregamento apenas na primeira carga */}
      {loading && !processedData && (
        <LoadingOverlay>
          Carregando dados da tabela...
        </LoadingOverlay>
      )}
    </TableWrapper>
  );
};

export default OptimizedTableVirtualFootball; 