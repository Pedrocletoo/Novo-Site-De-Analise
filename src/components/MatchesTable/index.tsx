import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useMatchData } from '../../hooks';
import { IMatch } from '../../services/api';
import {
  TableContainer,
  Table,
  TableHeaderSection,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TeamName,
  Score,
  TimeDisplay,
  LoadingIndicator,
  ErrorMessage,
  RefreshButton,
  NoDataMessage,
  StatusIndicator,
  LastUpdatedInfo,
  TableHeader
} from './styles';
import { useResultSelection } from '../../hooks/useResultSelection';

/**
 * Componente que extraí o horário da partida em formato legível
 */
const MatchTime: React.FC<{ startTime: string }> = ({ startTime }) => {
  const formattedTime = useMemo(() => {
    try {
      const date = new Date(startTime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Erro ao processar horário:', error);
      return '00:00';
    }
  }, [startTime]);

  return <TimeDisplay>{formattedTime}</TimeDisplay>;
};

/**
 * Componente que extraí e formata o placar da partida
 */
const MatchScore: React.FC<{ match: IMatch }> = ({ match }) => {
  const { FullTimeHomeTeam, FullTimeAwayTeam } = match;

  const homeScore = parseInt(FullTimeHomeTeam) || 0;
  const awayScore = parseInt(FullTimeAwayTeam) || 0;

  return <Score>{`${homeScore}-${awayScore}`}</Score>;
};

/**
 * Componente que extraí os nomes dos times
 */
const TeamNames: React.FC<{ match: IMatch }> = ({ match }) => {
  const homeTeam = match.DisplayNameParts?.[0]?.name || 'Time Casa';
  const awayTeam = match.DisplayNameParts?.[1]?.name || 'Time Visitante';

  return (
    <TeamName>
      <span>{homeTeam}</span>
      <span>vs</span>
      <span>{awayTeam}</span>
    </TeamName>
  );
};

/**
 * Props para o componente MatchesTable
 */
interface MatchesTableProps {
  matches?: IMatch[]; // Lista opcional de partidas filtradas
  liga?: string;
  result?: string;
}

/**
 * Componente principal da tabela de partidas
 * Usa polling para atualizações periódicas com atualização silenciosa
 */
const MatchesTable: React.FC<MatchesTableProps> = ({ 
  matches: filteredMatches,
  liga = 'euro',
  result = '480'
}) => {
  // Usando o hook de API para dados periódicos
  const { 
    matches: apiMatches, 
    loading, 
    error, 
    refetch,
    connected,
    lastUpdated,
    isBackgroundRefreshing
  } = useMatchData(liga, result);

  // Usa as partidas filtradas recebidas como props ou todas as partidas da API
  const matchesToDisplay = filteredMatches || apiMatches;
  
  // Referência para rastrear se houve mudança nos dados para medição de performance
  const prevMatchesRef = useRef<IMatch[] | null>(null);
  
  // Estado para controlar a exibição da mensagem de atualização
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  
  // Usar o hook de seleção de resultados
  const { formatResult, selectResult, getStyleFromScores } = useResultSelection();
  
  // Efeito para medir o tempo de atualização da tabela quando os dados mudam
  useEffect(() => {
    if (prevMatchesRef.current && matchesToDisplay.length > 0) {
      // Comparamos apenas o primeiro jogo como amostra para verificar se os dados mudaram
      const currentFirstMatch = matchesToDisplay[0];
      const prevFirstMatch = prevMatchesRef.current[0];
      
      if (currentFirstMatch && prevFirstMatch && 
          (currentFirstMatch.id !== prevFirstMatch.id ||
           currentFirstMatch.FullTimeHomeTeam !== prevFirstMatch.FullTimeHomeTeam ||
           currentFirstMatch.FullTimeAwayTeam !== prevFirstMatch.FullTimeAwayTeam)) {
        console.log('=== Tabela atualizada com novos dados ===');
        console.log(`Total de partidas na tabela: ${matchesToDisplay.length}`);
        console.log(`Tempo de renderização completa medido no componente MatchesTable`);
        
        // Mostra mensagem de atualização
        setShowUpdateMessage(true);
        setTimeout(() => setShowUpdateMessage(false), 5000);
        
        // Medir o tempo de pintura no navegador
        const paintStart = performance.now();
        requestAnimationFrame(() => {
          const paintEnd = performance.now();
          console.log(`Tempo estimado até a pintura no navegador: ${(paintEnd - paintStart).toFixed(2)}ms`);
        });
      }
    }
    
    // Armazenar referência aos dados atuais
    prevMatchesRef.current = matchesToDisplay;
  }, [matchesToDisplay]);

  // Função para lidar com o clique em uma linha da tabela
  const handleRowClick = (match: IMatch) => {
    const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    const result = formatResult(homeScore, awayScore);
    
    // Selecionar o resultado
    selectResult(result);
  };

  // Renderiza a linha da tabela para cada partida
  const renderMatchRow = (match: IMatch) => {
    const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
    const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
    
    // Obter estilo baseado nos scores
    const style = getStyleFromScores(homeScore, awayScore);
    
    return (
      <TableRow 
        key={match.id} 
        onClick={() => handleRowClick(match)}
        style={{ 
          cursor: style.cursor,
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          fontWeight: style.fontWeight
        }}
      >
        <TableCell style={{ color: style.textColor }}>
          <MatchTime startTime={match.StartTime} />
        </TableCell>
        <TableCell style={{ color: style.textColor }}>
          <TeamNames match={match} />
        </TableCell>
        <TableCell style={{ color: style.textColor }}>
          <MatchScore match={match} />
        </TableCell>
        <TableCell style={{ color: style.textColor }}>{match.Liga}</TableCell>
      </TableRow>
    );
  };

  // Formata a data para exibição
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Aguardando dados...';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    if (diff < 10000) return 'Agora mesmo';
    if (diff < 60000) return `${Math.floor(diff / 1000)} segundos atrás`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutos atrás`;
    
    return `${lastUpdated.getHours()}:${String(lastUpdated.getMinutes()).padStart(2, '0')}`;
  };

  // Estado de carregamento - sempre mostrar para visualizar as atualizações
  if (loading && matchesToDisplay.length === 0) {
    return (
      <LoadingIndicator>
        <div style={{ textAlign: 'center' }}>
          <div>Carregando dados das partidas...</div>
        </div>
      </LoadingIndicator>
    );
  }

  // Tratamento de erro (apenas quando não recebeu partidas filtradas)
  if (!filteredMatches && error && matchesToDisplay.length === 0) {
    return (
      <ErrorMessage>
        <p>Erro ao carregar dados: {error.message}</p>
        <RefreshButton onClick={() => refetch()}>Tentar novamente</RefreshButton>
      </ErrorMessage>
    );
  }

  // Caso não tenha partidas
  if (!matchesToDisplay || matchesToDisplay.length === 0) {
    return <NoDataMessage>Nenhuma partida encontrada.</NoDataMessage>;
  }

  // Renderiza a tabela com os dados
  return (
    <TableContainer>
      <TableHeader>
        <h2>Resultados {liga.toUpperCase()}</h2>
        <div className="table-controls">
          <StatusIndicator connected={connected} />
          <LastUpdatedInfo>
            Atualizado: {formatLastUpdated()}
          </LastUpdatedInfo>
          <RefreshButton onClick={() => refetch()} disabled={loading || isBackgroundRefreshing}>
            {loading || isBackgroundRefreshing ? 'Atualizando...' : 'Atualizar agora'}
          </RefreshButton>
        </div>
      </TableHeader>

      {/* Tabela sem envoltório extra que estava causando espaço */}
      <Table>
        <TableHeaderSection>
          <TableRow>
            <TableHeaderCell>Jogo</TableHeaderCell>
            <TableHeaderCell>Horário</TableHeaderCell>
            <TableHeaderCell>Resultado</TableHeaderCell>
          </TableRow>
        </TableHeaderSection>
        <TableBody>
          {matchesToDisplay.map(renderMatchRow)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MatchesTable; 