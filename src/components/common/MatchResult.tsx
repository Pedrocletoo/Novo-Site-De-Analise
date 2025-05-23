import React from 'react';
import styled from 'styled-components';
import { IMatch } from '../../services/api';
import { useResultSelection } from '../../hooks/useResultSelection';
import { TimeFilterOption } from '../Filters/common/TimeFilter';

interface MatchResultProps {
  match: IMatch;
  timeFilter: TimeFilterOption;
  onClick?: () => void;
}

// Componente estilizado para o resultado
const ScoreContainer = styled.div<{ $textColor?: string }>`
  color: ${props => props.$textColor || 'inherit'};
  font-weight: ${props => props.style?.fontWeight || 'normal'};
`;

const Score = styled.div`
  font-size: 15px;
  font-weight: bold;
`;

const HalfTimeScore = styled.div`
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
  font-weight: bold;
`;

/**
 * Componente reutilizável para exibir resultados de partidas
 * Exibe o placar de acordo com o filtro de tempo (HT, FT, HT+FT)
 */
const MatchResult: React.FC<MatchResultProps> = ({ match, timeFilter, onClick }) => {
  const { formatResult, getStyleFromScores } = useResultSelection();
  
  // Extrair e formatar os scores
  const ftHomeScore = parseInt(match.FullTimeHomeTeam) || 0;
  const ftAwayScore = parseInt(match.FullTimeAwayTeam) || 0;
  const htHomeScore = parseInt(match.HalfTimeHomeTeam) || 0;
  const htAwayScore = parseInt(match.HalfTimeAwayTeam) || 0;
  
  // Obter os scores corretos com base no filtro de tempo
  let displayHomeScore = ftHomeScore;
  let displayAwayScore = ftAwayScore;
  
  if (timeFilter === 'HT') {
    displayHomeScore = htHomeScore;
    displayAwayScore = htAwayScore;
  }
  
  // Obter o estilo com base no resultado
  const resultStyle = getStyleFromScores(displayHomeScore, displayAwayScore);
  
  // Renderizar o resultado de acordo com o filtro de tempo
  return (
    <ScoreContainer 
      $textColor={resultStyle.textColor}
      style={{ fontWeight: resultStyle.fontWeight }}
      onClick={onClick}
    >
      {timeFilter === 'HT' && (
        <Score>{`${htHomeScore}-${htAwayScore}`}</Score>
      )}
      
      {timeFilter === 'FT' && (
        <Score>{`${ftHomeScore}-${ftAwayScore}`}</Score>
      )}
      
      {timeFilter === 'HT+FT' && (
        <>
          <Score>{`${ftHomeScore}-${ftAwayScore}`}</Score>
          <HalfTimeScore>{`${htHomeScore}-${htAwayScore}`}</HalfTimeScore>
        </>
      )}
    </ScoreContainer>
  );
};

export default MatchResult; 