import React from 'react';
import { useMatchData, useMatchTime, useMatchScore } from '../../hooks';
import { 
  MatchesContainer, 
  MatchItem, 
  TeamNames, 
  MatchTime, 
  MatchScore,
  LoadingIndicator,
  ErrorMessage
} from './styles';

/**
 * Componente para exibir um único jogo
 */
const MatchListItem: React.FC<{ matchId: string }> = ({ matchId }) => {
  // Buscando todos os jogos para encontrar o específico por ID
  const { matches } = useMatchData();
  const match = matches.find(m => m.id === matchId);
  
  // Utilizando hooks especializados para extrair dados formatados
  const { formatted: formattedTime } = useMatchTime(match);
  const { fullTime, halfTime } = useMatchScore(match);
  
  if (!match) return null;
  
  // Extrai nomes dos times
  const homeTeam = match.DisplayNameParts[0]?.name || 'Time Casa';
  const awayTeam = match.DisplayNameParts[1]?.name || 'Time Visitante';
  
  return (
    <MatchItem>
      <TeamNames>
        <span>{homeTeam}</span>
        <span>vs</span>
        <span>{awayTeam}</span>
      </TeamNames>
      
      <MatchTime>
        Horário: {formattedTime}
      </MatchTime>
      
      <MatchScore>
        <div>
          <span>Placar Final: {fullTime.formatted}</span>
        </div>
        <div>
          <span>Primeiro Tempo: {halfTime.formatted}</span>
        </div>
      </MatchScore>
    </MatchItem>
  );
};

/**
 * Componente principal para listar todas as partidas
 */
const MatchesList: React.FC = () => {
  const { matches, loading, error, refetch } = useMatchData();

  if (loading) {
    return <LoadingIndicator>Carregando partidas...</LoadingIndicator>;
  }

  if (error) {
    return (
      <ErrorMessage>
        <p>Erro ao carregar partidas: {error.message}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </ErrorMessage>
    );
  }

  if (matches.length === 0) {
    return <div>Nenhuma partida encontrada.</div>;
  }

  return (
    <MatchesContainer>
      <h2>Partidas Disponíveis</h2>
      {matches.map(match => (
        <MatchListItem key={match.id} matchId={match.id} />
      ))}
    </MatchesContainer>
  );
};

export default MatchesList; 