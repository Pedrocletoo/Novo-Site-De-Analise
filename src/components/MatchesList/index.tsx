import React, { useState, useEffect } from 'react';
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
  const [showLoading, setShowLoading] = useState(true);
  const { matches, loading, error, refetch } = useMatchData();
  
  // Efeito para controlar a exibição da mensagem de carregamento
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Ao iniciar carregamento, agendamos a exibição da mensagem
      // após 300ms para evitar flashes de loading em requisições rápidas
      timer = setTimeout(() => setShowLoading(true), 300);
    } else {
      // Dados carregados, escondemos o loading mas com um breve delay
      timer = setTimeout(() => setShowLoading(false), 100);
    }
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <LoadingIndicator>
        <div style={{ textAlign: 'center' }}>
          <div>Carregando partidas...</div>
          <div style={{ 
            fontSize: '12px', 
            marginTop: '8px',
            opacity: 0.7 
          }}>
            Atualização automática a cada 9 segundos
          </div>
        </div>
      </LoadingIndicator>
    );
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