import React, { useMemo } from 'react';
import { useMatchData } from '../../hooks';
import { IMatch } from '../../services/api';
import {
  TableContainer,
  Table,
  TableHeader,
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
  NoDataMessage
} from './styles';

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
}

/**
 * Componente principal da tabela de partidas
 * Consome o hook useMatchData para obter os dados da API
 * ou aceita uma lista de partidas já filtradas via props
 */
const MatchesTable: React.FC<MatchesTableProps> = ({ matches: filteredMatches }) => {
  // Usando o mesmo hook que a página /partidas utiliza
  const { matches: apiMatches, loading, error, refetch } = useMatchData();

  // Usa as partidas filtradas recebidas como props ou todas as partidas da API
  const matchesToDisplay = filteredMatches || apiMatches;

  // Renderiza a linha da tabela para cada partida
  const renderMatchRow = (match: IMatch) => (
    <TableRow key={match.id}>
      <TableCell>
        <MatchTime startTime={match.StartTime} />
      </TableCell>
      <TableCell>
        <TeamNames match={match} />
      </TableCell>
      <TableCell>
        <MatchScore match={match} />
      </TableCell>
      <TableCell>{match.Liga}</TableCell>
    </TableRow>
  );

  // Estado de carregamento (apenas quando não recebeu partidas filtradas)
  if (!filteredMatches && loading) {
    return <LoadingIndicator>Carregando dados das partidas...</LoadingIndicator>;
  }

  // Tratamento de erro (apenas quando não recebeu partidas filtradas)
  if (!filteredMatches && error) {
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
      {!filteredMatches && (
        <RefreshButton onClick={() => refetch()}>
          Atualizar dados
        </RefreshButton>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Horário</TableHeaderCell>
            <TableHeaderCell>Times</TableHeaderCell>
            <TableHeaderCell>Placar</TableHeaderCell>
            <TableHeaderCell>Liga</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchesToDisplay.map(renderMatchRow)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MatchesTable; 