import React, { useEffect, useState } from 'react';
import { 
  PageContainer, 
  PageTitle, 
  ApiDataContainer,
  RefreshButton,
  MatchDetail,
  MatchDetailItem,
  MatchDetailLabel,
  MatchDetailValue,
  TimeInfo
} from './styles';
import { useMatchData } from '../../hooks';
import { IMatch } from '../../services/api';
import TableVirtualFootball from '../../components/TableVirtualFootball';

/**
 * Componente para exibição detalhada dos dados de uma partida
 */
const MatchDetails: React.FC<{ match: IMatch; isUpdating?: boolean }> = ({ match, isUpdating = false }) => {
  // Extrai as informações de hora e minuto da partida
  const [timeInfo, setTimeInfo] = useState({ hour: 0, minute: 0 });
  
  useEffect(() => {
    if (match?.StartTime) {
      try {
        const date = new Date(match.StartTime);
        setTimeInfo({
          hour: date.getHours(),
          minute: date.getMinutes()
        });
      } catch (error) {
        console.error('Erro ao processar horário:', error);
      }
    }
  }, [match?.StartTime]);
  
  if (!match) return null;
  
  const homeTeam = match.DisplayNameParts[0]?.name || 'Time Casa';
  const awayTeam = match.DisplayNameParts[1]?.name || 'Time Visitante';
  
  // Extrair dados de placar
  const fullTimeHome = Number(match.FullTimeHomeTeam) || 0;
  const fullTimeAway = Number(match.FullTimeAwayTeam) || 0;
  const halfTimeHome = Number(match.HalfTimeHomeTeam) || 0;
  const halfTimeAway = Number(match.HalfTimeAwayTeam) || 0;
  
  return (
    <MatchDetail>
      <MatchDetailItem>
        <MatchDetailLabel>ID da Partida:</MatchDetailLabel>
        <MatchDetailValue>{match.id}</MatchDetailValue>
      </MatchDetailItem>
      
      <MatchDetailItem>
        <MatchDetailLabel>Times:</MatchDetailLabel>
        <MatchDetailValue>{homeTeam} vs {awayTeam}</MatchDetailValue>
      </MatchDetailItem>
      
      <MatchDetailItem>
        <MatchDetailLabel>Horário:</MatchDetailLabel>
        <TimeInfo data-hour={timeInfo.hour} data-minute={timeInfo.minute}>
          {timeInfo.hour.toString().padStart(2, '0')}:{timeInfo.minute.toString().padStart(2, '0')}
        </TimeInfo>
      </MatchDetailItem>
      
      <MatchDetailItem>
        <MatchDetailLabel>Resultado Final:</MatchDetailLabel>
        <MatchDetailValue>{fullTimeHome} x {fullTimeAway}</MatchDetailValue>
      </MatchDetailItem>
      
      <MatchDetailItem>
        <MatchDetailLabel>Primeiro Tempo:</MatchDetailLabel>
        <MatchDetailValue>{halfTimeHome} x {halfTimeAway}</MatchDetailValue>
      </MatchDetailItem>
    </MatchDetail>
  );
};

/**
 * Componente para exibição da tabela de partidas por hora
 */
const TableTester: React.FC = () => {
  const { matches, loading, error, refetch, isBackgroundRefreshing } = useMatchData();
  const [testHour, setTestHour] = useState<number | null>(null);
  
  // Gerar as opções de horas para o seletor
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Atualizar a hora de teste
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTestHour(value === "" ? null : Number(value));
  };
  
  // Resetar seleção de hora
  const handleResetHour = () => {
    setTestHour(null);
  };
  
  // Filtrar os jogos por hora específica, se selecionada
  const filteredMatches = testHour !== null 
    ? matches.filter(match => {
        try {
          const date = new Date(match.StartTime);
          const hour = date.getHours();
          return hour === testHour;
        } catch (error) {
          console.error('Erro ao processar horário:', error);
          return false;
        }
      })
    : matches;
  
  return (
    <div className="table-tester" style={{ marginBottom: '30px' }}>
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '15px',
        backgroundColor: '#f0f9ff',
        borderRadius: '4px',
        position: 'relative'
      }}>
        <div>
          <RefreshButton onClick={() => refetch()} disabled={loading || isBackgroundRefreshing}>
            {loading && matches.length === 0 ? 'Carregando...' : isBackgroundRefreshing ? 'Atualizando...' : 'Atualizar Dados da API'}
          </RefreshButton>
        </div>
        
        <div>
          <label htmlFor="filter-hour" style={{ marginRight: '8px' }}>Filtrar por Hora:</label>
          <select 
            id="filter-hour" 
            value={testHour === null ? "" : testHour}
            onChange={handleHourChange}
            style={{ 
              padding: '6px 10px', 
              borderRadius: '4px', 
              border: '1px solid #ccc'
            }}
          >
            <option value="">Todas as horas</option>
            {hourOptions.map(hour => (
              <option key={hour} value={hour}>
                {hour.toString().padStart(2, '0')}:00
              </option>
            ))}
          </select>
          
          {testHour !== null && (
            <button 
              onClick={handleResetHour}
              style={{
                marginLeft: '8px',
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer'
              }}
            >
              Limpar Filtro
            </button>
          )}
        </div>
        
        <div>
          <span style={{ fontWeight: 'bold' }}>
            Total de Jogos{testHour !== null ? ` (Hora ${testHour})` : ''}: {filteredMatches.length}
          </span>
        </div>
      </div>
      
      {loading && matches.length === 0 && <div>Carregando dados da API...</div>}
      {error && matches.length === 0 && <div>Erro ao carregar dados: {error.message}</div>}
      
      <div style={{ marginTop: '20px' }}>
        <TableVirtualFootball />
      </div>
    </div>
  );
};

/**
 * Página de exibição dos dados da API
 */
const MatchesData: React.FC = () => {
  const { matches, loading, error, refetch, isBackgroundRefreshing } = useMatchData();
  const [selectedMatch, setSelectedMatch] = useState<IMatch | null>(null);
  
  // Selecionar o primeiro jogo para detalhes quando os dados chegarem
  useEffect(() => {
    if (matches.length > 0 && !selectedMatch) {
      setSelectedMatch(matches[0]);
    }
  }, [matches, selectedMatch]);
  
  const handleRefresh = () => {
    refetch();
    setSelectedMatch(null);
  };
  
  const showMatchDetails = (match: IMatch) => {
    setSelectedMatch(match);
  };
  
  // Adicionar estilo CSS para animação da barra de progresso
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes progress-bar-animation {
        0% { width: 0%; left: 0; right: auto; }
        50% { width: 100%; left: 0; right: auto; }
        51% { width: 100%; right: 0; left: auto; }
        100% { width: 0%; right: 0; left: auto; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <PageContainer>
      <PageTitle>Dados da API de Jogos</PageTitle>
      
      <div style={{ position: 'relative' }}>
        <RefreshButton onClick={handleRefresh} disabled={loading || isBackgroundRefreshing}>
          {loading && matches.length === 0 ? 'Carregando...' : isBackgroundRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </RefreshButton>
      </div>
      
      {/* Mostrar mensagem de carregamento apenas na carga inicial, quando não temos dados */}
      {loading && matches.length === 0 && <p>Carregando dados...</p>}
      {error && matches.length === 0 && <p>Erro ao carregar dados: {error.message}</p>}
      
      {/* Se temos dados, exibir sempre, mesmo durante o loading ou com erro */}
      {matches.length > 0 && (
        <>
          <h2>Detalhes do Primeiro Jogo:</h2>
          {selectedMatch && <MatchDetails match={selectedMatch} isUpdating={isBackgroundRefreshing} />}
          
          <h2>Tabela de Jogos por Hora:</h2>
          <TableTester />
        </>
      )}
    </PageContainer>
  );
};

export default MatchesData; 