import React, { useState, useEffect } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { useHourlyStats } from '../hooks/useTimeTable';

interface HourlyStatsProps {
  liga?: string;
}

const HourlyStats: React.FC<HourlyStatsProps> = ({ liga = 'euro' }) => {
  // Estado para controlar exibição do loading
  const [showLoading, setShowLoading] = useState(true);
  
  // Buscar dados da API usando o hook existente
  const { matches, loading, error } = useMatchData(liga);
  
  // Processar estatísticas por hora
  const hourlyStats = useHourlyStats(matches);
  
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
  
  // Filtrando apenas horas com jogos
  const activeHours = Object.keys(hourlyStats)
    .map(Number)
    .filter(hour => hourlyStats[hour].totalGames > 0)
    .sort((a, b) => a - b);
  
  // Renderização condicional baseada no estado de carregamento
  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center' }}>
        <div>Carregando estatísticas...</div>
        <div style={{ 
          fontSize: '12px', 
          marginTop: '8px',
          opacity: 0.7 
        }}>
          Atualização automática a cada 9 segundos
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="error">Erro ao carregar estatísticas: {error.message}</div>;
  }
  
  // Sem dados para exibir
  if (activeHours.length === 0) {
    return (
      <div className="no-data">
        <p>Não há dados de jogos finalizados disponíveis para análise.</p>
      </div>
    );
  }
  
  return (
    <div className="hourly-stats-container">
      <h3>Estatísticas de Jogos Finalizados por Hora do Dia</h3>
      <p className="stats-description">
        Análise do desempenho de resultados baseado no horário de início dos jogos finalizados.
      </p>
      
      <div className="stats-grid">
        {activeHours.map(hour => {
          const stats = hourlyStats[hour];
          const homeWinPercentage = Math.round((stats.homeWins / stats.totalGames) * 100);
          const awayWinPercentage = Math.round((stats.awayWins / stats.totalGames) * 100);
          const drawPercentage = Math.round((stats.draws / stats.totalGames) * 100);
          
          return (
            <div key={hour} className="hour-card">
              <div className="hour-header">
                <h4>{hour.toString().padStart(2, '0')}:00 - {hour.toString().padStart(2, '0')}:59</h4>
                <span className="total-games">{stats.totalGames} jogos</span>
              </div>
              
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Vitórias Casa</span>
                  <div className="stat-value">
                    <span className="numeric">{stats.homeWins}</span>
                    <span className="percentage">({homeWinPercentage}%)</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Empates</span>
                  <div className="stat-value">
                    <span className="numeric">{stats.draws}</span>
                    <span className="percentage">({drawPercentage}%)</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Vitórias Fora</span>
                  <div className="stat-value">
                    <span className="numeric">{stats.awayWins}</span>
                    <span className="percentage">({awayWinPercentage}%)</span>
                  </div>
                </div>
              </div>
              
              <div className="result-bar">
                <div 
                  className="home-bar" 
                  style={{ width: `${homeWinPercentage}%` }}
                  title={`Vitórias em casa: ${homeWinPercentage}%`}
                ></div>
                <div 
                  className="draw-bar" 
                  style={{ width: `${drawPercentage}%` }}
                  title={`Empates: ${drawPercentage}%`}
                ></div>
                <div 
                  className="away-bar" 
                  style={{ width: `${awayWinPercentage}%` }}
                  title={`Vitórias fora: ${awayWinPercentage}%`}
                ></div>
              </div>
              
              <div className="goals-info">
                <span className="goals-label">Média de gols por jogo:</span>
                <span className="goals-value">{stats.goalsPerGame}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color home-color"></div>
          <span>Vitória Mandante</span>
        </div>
        <div className="legend-item">
          <div className="legend-color draw-color"></div>
          <span>Empate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color away-color"></div>
          <span>Vitória Visitante</span>
        </div>
      </div>
      
      <style>
        {`
          .hourly-stats-container {
            font-family: 'Roboto', sans-serif;
            width: 100%;
            max-width: 1200px;
            margin: 30px auto;
            padding: 20px;
          }
          
          .stats-description {
            color: #666;
            margin-bottom: 20px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .hour-card {
            background-color: white;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 16px;
            border: 1px solid #eee;
            transition: transform 0.2s ease;
          }
          
          .hour-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }
          
          .hour-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 8px;
          }
          
          .hour-header h4 {
            margin: 0;
            color: #1890ff;
            font-size: 16px;
          }
          
          .total-games {
            background-color: #f0f0f0;
            color: #666;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
          }
          
          .stats-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          
          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 4px;
          }
          
          .stat-label {
            font-size: 11px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .stat-value {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .numeric {
            font-weight: bold;
            font-size: 16px;
          }
          
          .percentage {
            font-size: 12px;
            color: #666;
          }
          
          .result-bar {
            height: 8px;
            display: flex;
            border-radius: 4px;
            overflow: hidden;
            background-color: #f5f5f5;
            margin-bottom: 12px;
          }
          
          .home-bar {
            background-color: #52c41a;
            height: 100%;
          }
          
          .draw-bar {
            background-color: #faad14;
            height: 100%;
          }
          
          .away-bar {
            background-color: #f5222d;
            height: 100%;
          }
          
          .goals-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            border-top: 1px dashed #f0f0f0;
            font-size: 13px;
          }
          
          .goals-label {
            color: #666;
          }
          
          .goals-value {
            font-weight: bold;
            color: #1890ff;
          }
          
          .legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 16px;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #666;
          }
          
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            margin-right: 8px;
          }
          
          .home-color {
            background-color: #52c41a;
          }
          
          .draw-color {
            background-color: #faad14;
          }
          
          .away-color {
            background-color: #f5222d;
          }
          
          .loading, .error, .no-data {
            padding: 30px;
            text-align: center;
            border-radius: 4px;
            margin: 20px 0;
          }
          
          .loading {
            background-color: #e6f7ff;
            color: #1890ff;
          }
          
          .error {
            background-color: #fff1f0;
            color: #f5222d;
          }
          
          .no-data {
            background-color: #f5f5f5;
            color: #666;
          }
        `}
      </style>
    </div>
  );
};

export default HourlyStats; 