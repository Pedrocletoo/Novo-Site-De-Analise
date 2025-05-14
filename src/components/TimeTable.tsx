import React, { useMemo, useState } from 'react';
import { IMatch } from '../services/api';
import { useTimeTable, useMatchSummary } from '../hooks/useTimeTable';

/**
 * IMPORTANTE: Os minutos dos jogos SEMPRE correspondem exatamente aos minutos definidos abaixo.
 * Não existem jogos em minutos intermediários ou aproximados.
 * Cada jogo começa exatamente em um dos minutos listados abaixo, garantindo
 * correspondência direta com as colunas da tabela.
 */
const FIXED_MINUTE_BLOCKS = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58];

interface TimeTableProps {
  liga?: string;
  testMode?: boolean;
  testHour?: number; // Uma hora específica para modo de teste
  matches?: IMatch[]; // Jogos da API para exibir
  selectedHours?: number[]; // Múltiplas horas para exibir
}

/**
 * Componente TimeTable - Exibe uma tabela de horários com jogos
 * 
 * REGRAS IMPORTANTES:
 * - A tabela é organizada por horas (linhas) e minutos específicos (colunas)
 * - Os jogos SEMPRE começam exatamente nos minutos mostrados nas colunas
 * - Não existem jogos em minutos intermediários ou aproximados
 * - Cada jogo corresponde precisamente a uma célula específica
 * - Exemplo: Um jogo às 15:43 aparece na linha 15, coluna 43
 */
const TimeTable: React.FC<TimeTableProps> = ({ 
  liga = 'euro',
  testMode = false,
  testHour,
  matches = [],
  selectedHours
}) => {
  const [selectedCell, setSelectedCell] = useState<{hour: number, minute: number} | null>(null);
  
  // Processar os dados da tabela usando o hook
  const { hours, minuteBlocks, cells } = useTimeTable(matches, testMode, testHour, selectedHours);
  
  // Formatar minutos com padding de zeros para exibição
  const formattedMinutes = useMemo(() => {
    return FIXED_MINUTE_BLOCKS.map(minute => 
      minute.toString().padStart(2, '0')
    );
  }, []);
  
  // Obter as partidas da célula selecionada
  const selectedCellMatches = useMemo(() => {
    if (!selectedCell) return [];
    
    const { hour, minute } = selectedCell;
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    
    // Log de depuração para verificar se os jogos estão sendo posicionados corretamente
    if (cellData?.matches.length > 0) {
      console.log(`Célula ${hour}:${minute} contém ${cellData.matches.length} jogo(s)`);
      cellData.matches.forEach((match, index) => {
        try {
          const date = new Date(match.StartTime);
          const matchHour = date.getHours();
          const matchMinute = date.getMinutes();
          console.log(`Jogo ${index+1}: ID=${match.id}, Hora=${matchHour}, Minuto=${matchMinute}`);
          
          // Verificação adicional para garantir que o jogo está posicionado corretamente
          if (matchHour !== hour || matchMinute !== minute) {
            console.error(`ERRO DE POSICIONAMENTO: Jogo ${match.id} deveria estar na célula ${matchHour}:${matchMinute}, mas está em ${hour}:${minute}`);
          }
        } catch (error) {
          console.error('Erro ao verificar horário do jogo:', error);
        }
      });
    }
    
    return cellData?.matches || [];
  }, [selectedCell, cells]);
  
  // Gerar os resumos das partidas no nível do componente (correto para uso de hooks)
  const matchSummaries = useMatchSummary(selectedCellMatches);
  
  // Exibir detalhes das partidas quando uma célula é clicada
  const handleCellClick = (hour: number, minute: number) => {
    setSelectedCell({ hour, minute });
  };
  
  // Fechar os detalhes da célula
  const handleCloseDetails = () => {
    setSelectedCell(null);
  };
  
  // Renderização da célula com possíveis partidas
  const renderCell = (hour: number, minute: number) => {
    const cellKey = `${hour}:${minute}`;
    const cellData = cells[cellKey];
    const hasMatches = cellData && cellData.matches.length > 0;
    
    return (
      <td 
        key={cellKey} 
        className={`minute-cell ${hasMatches ? 'has-matches' : ''}`}
        style={{ 
          backgroundColor: hasMatches ? '#e6f7ff' : '#f9f9f9',
          cursor: hasMatches ? 'pointer' : 'default'
        }}
        onClick={hasMatches ? () => handleCellClick(hour, minute) : undefined}
      >
        {hasMatches && (
          <div className="match-indicator">
            {cellData.matches.map((match, index) => {
              const homeScore = parseInt(match.FullTimeHomeTeam) || 0;
              const awayScore = parseInt(match.FullTimeAwayTeam) || 0;
              return (
                <div key={match.id} className="match-score">
                  {homeScore}-{awayScore}
                </div>
              );
            })}
          </div>
        )}
      </td>
    );
  };
  
  // Renderizar detalhes das partidas selecionadas
  const renderCellDetails = () => {
    if (!selectedCell) return null;
    
    const { hour, minute } = selectedCell;
    
    if (selectedCellMatches.length === 0) return null;
    
    return (
      <div className="cell-details">
        <div className="cell-details-header">
          <h3>Jogos às {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}</h3>
          <button className="close-button" onClick={handleCloseDetails}>&times;</button>
        </div>
        <div className="matches-list">
          {matchSummaries.map((summary, index) => (
            <div key={index} className="match-summary">{summary}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="time-table-container">
      <h2>
        {testMode 
          ? selectedHours && selectedHours.length > 0
            ? `Teste: Jogos Finalizados das Horas ${selectedHours.map(h => h.toString().padStart(2, '0')).join(', ')}`
            : `Teste: Jogos Finalizados ${testHour !== undefined ? `da Hora ${testHour}` : 'da Hora 23'}`
          : 'Tabela de Jogos Finalizados por Horário'}
      </h2>
      
      {testMode && (
        <div className="test-mode-banner">
          Modo de teste ativado - Exibindo apenas jogos 
          {selectedHours && selectedHours.length > 0
            ? ` das horas ${selectedHours.map(h => h.toString().padStart(2, '0')).join(', ')}`
            : testHour !== undefined ? ` da hora ${testHour}` : ' da hora 23'}
        </div>
      )}
      
      {!testMode && (
        <p className="table-description">
          Esta tabela mostra apenas jogos que já foram finalizados, organizados pelo horário de início.
          Cada célula indica o número de jogos finalizados que começaram naquele horário específico.
          <strong> Os jogos SEMPRE começam exatamente nos minutos mostrados nas colunas.</strong>
        </p>
      )}
      
      <div className="table-scroll-container">
        <table className="time-table">
          <thead>
            <tr>
              <th className="hora-minuto-header">
                <div className="hora-label">Hora</div>
                <div className="minuto-label">Minuto</div>
              </th>
              {formattedMinutes.map(minute => (
                <th key={minute} className="minute-header">
                  {minute}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="hour-cell">
                  {hour.toString().padStart(2, '0')}
                </td>
                {FIXED_MINUTE_BLOCKS.map(minute => 
                  renderCell(hour, minute)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedCell && renderCellDetails()}
      
      <style>
        {`
          .time-table-container {
            font-family: 'Roboto', sans-serif;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .test-mode-banner {
            background-color: #ffe58f;
            color: #5c3c11;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
          }
          
          .no-test-data {
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 4px;
            text-align: center;
            margin: 20px;
          }
          
          .table-description {
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            background-color: #f0f9ff;
            padding: 12px;
            border-radius: 4px;
            border-left: 4px solid #1890ff;
          }
          
          .table-scroll-container {
            overflow-x: auto;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          
          .time-table {
            border-collapse: collapse;
            width: 100%;
            min-width: 1200px;
          }
          
          .hora-minuto-header {
            background-color: #1a2140;
            color: white;
            position: relative;
            padding: 10px;
            width: 60px;
            border: 1px solid #ddd;
          }
          
          .hora-label, .minuto-label {
            font-size: 12px;
            font-weight: 500;
          }
          
          .hora-label {
            border-bottom: 1px solid rgba(255,255,255,0.3);
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          
          .minute-header {
            background-color: #1a2140;
            color: white;
            font-weight: 500;
            padding: 10px 5px;
            text-align: center;
            border: 1px solid #ddd;
            width: 40px;
          }
          
          .hour-cell, .minute-cell {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          
          .hour-cell {
            background-color: #1a2140;
            color: white;
            font-weight: 500;
          }
          
          .minute-cell {
            width: 40px;
            height: 40px;
            position: relative;
          }
          
          .has-matches {
            transition: all 0.2s ease;
          }
          
          .has-matches:hover {
            background-color: #bae7ff !important;
          }
          
          .match-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #1890ff;
            color: white;
            border-radius: 4px;
            min-width: 22px;
            height: auto;
            padding: 2px 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          
          .match-score {
            margin: 2px 0;
            white-space: nowrap;
            font-weight: bold;
          }
          
          .cell-details {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-top: 20px;
            padding: 16px;
            border: 1px solid #eee;
          }
          
          .cell-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          
          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
          }
          
          .matches-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .loading, .error {
            padding: 20px;
            text-align: center;
            border-radius: 4px;
          }
          
          .loading {
            background-color: #e6f7ff;
            color: #1890ff;
          }
          
          .error {
            background-color: #fff1f0;
            color: #f5222d;
          }
          
          .match-summary {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          
          .match-summary:last-child {
            border-bottom: none;
          }
        `}
      </style>
    </div>
  );
};

export default TimeTable; 