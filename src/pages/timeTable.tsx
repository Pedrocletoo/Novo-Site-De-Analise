import React, { useState } from 'react';
import TimeTable from '../components/TimeTable';
import HourlyStats from '../components/HourlyStats';

const TimeTablePage: React.FC = () => {
  const [liga, setLiga] = useState<string>('euro');
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table');
  
  // Handler para mudança de liga
  const handleLigaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLiga(event.target.value);
  };
  
  // Handler para mudança de tab
  const handleTabChange = (tab: 'table' | 'stats') => {
    setActiveTab(tab);
  };
  
  return (
    <div className="time-table-page">
      <header className="page-header">
        <h1>Análise de Jogos Finalizados por Horário</h1>
        <p>Visualize os jogos finalizados organizados em uma tabela por horário de início</p>
      </header>
      
      <div className="info-banner">
        <div className="info-icon">i</div>
        <p>
          Esta ferramenta analisa apenas partidas já <strong>finalizadas</strong>. 
          Os dados são organizados pelo horário de início de cada jogo, facilitando a identificação 
          de padrões de resultados em determinados períodos do dia.
        </p>
      </div>
      
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="liga-input">Liga:</label>
          <input
            id="liga-input"
            type="text"
            value={liga}
            onChange={handleLigaChange}
            placeholder="Nome da liga"
            className="liga-input"
          />
          <div className="liga-hint">Padrão: euro</div>
        </div>
      </div>
      
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => handleTabChange('table')}
          >
            Tabela de Horários
          </button>
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => handleTabChange('stats')}
          >
            Estatísticas por Hora
          </button>
        </div>
      </div>
      
      <div className="content-container">
        {activeTab === 'table' && (
          <div className="table-container">
            <TimeTable liga={liga} />
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="stats-container">
            <HourlyStats liga={liga} />
          </div>
        )}
      </div>
      
      <footer className="page-footer">
        <p>Dados históricos de partidas finalizadas - Atualizado periodicamente</p>
      </footer>
      
      <style>
        {`
          .time-table-page {
            font-family: 'Roboto', sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .page-header {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .page-header h1 {
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          
          .page-header p {
            color: #666;
            font-size: 16px;
          }
          
          .info-banner {
            display: flex;
            align-items: flex-start;
            background-color: #fffbe6;
            border: 1px solid #ffe58f;
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 24px;
          }
          
          .info-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #faad14;
            color: white;
            font-weight: bold;
            margin-right: 16px;
            flex-shrink: 0;
          }
          
          .info-banner p {
            margin: 0;
            font-size: 14px;
            color: #5c3c11;
            line-height: 1.5;
          }
          
          .controls-container {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
          
          .control-group {
            display: flex;
            flex-direction: column;
            width: 300px;
          }
          
          .control-group label {
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }
          
          .liga-input {
            padding: 10px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.3s;
          }
          
          .liga-input:focus {
            border-color: #40a9ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            outline: none;
          }
          
          .liga-hint {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
          
          .tabs-container {
            margin-bottom: 24px;
          }
          
          .tabs {
            display: flex;
            border-bottom: 1px solid #e8e8e8;
          }
          
          .tab-button {
            padding: 12px 16px;
            border: none;
            background: none;
            font-size: 16px;
            color: #595959;
            cursor: pointer;
            position: relative;
            transition: all 0.3s;
          }
          
          .tab-button:hover {
            color: #1890ff;
          }
          
          .tab-button.active {
            color: #1890ff;
            font-weight: 500;
          }
          
          .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #1890ff;
          }
          
          .content-container {
            margin-bottom: 30px;
          }
          
          .table-container, .stats-container {
            animation: fadeIn 0.3s ease;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .page-footer {
            text-align: center;
            color: #999;
            padding: 20px 0;
            border-top: 1px solid #eee;
            margin-top: 40px;
          }
        `}
      </style>
    </div>
  );
};

export default TimeTablePage; 