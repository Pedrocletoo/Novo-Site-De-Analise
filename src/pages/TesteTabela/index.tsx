import React, { useState } from 'react';
import { useMatchData } from '../../hooks';
import { IMatch } from '../../services/api';
import TimeTable from '../../components/TimeTable';
import styled from 'styled-components';

// Estilos para a página de teste
const TesteContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #1a2140;
`;

const ControlPanel = styled.div`
  background-color: #f0f9ff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #40a9ff;
  }
`;

const Select = styled.select`
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
`;

const StatusMessage = styled.div`
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  
  &.loading {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  
  &.error {
    background-color: #fff1f0;
    color: #f5222d;
  }
`;

/**
 * Página para testar a visualização da tabela com dados da API
 */
const TesteTabela: React.FC = () => {
  // Buscar dados da API
  const { matches, loading, error, refetch } = useMatchData();
  
  // Estado para controlar a exibição da tabela
  const [testMode, setTestMode] = useState<boolean>(true);
  const [testHour, setTestHour] = useState<number>(23);
  
  // Gerar opções de horas para o seletor
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Atualizar a hora de teste selecionada
  const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTestHour(Number(event.target.value));
  };
  
  // Alternar modo de teste
  const handleToggleTestMode = () => {
    setTestMode(!testMode);
  };
  
  // Filtrar jogos por hora específica
  const filteredMatches = testMode 
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
    
  // Contar jogos por hora
  const countMatchesByHour = () => {
    const counts: Record<number, number> = {};
    matches.forEach(match => {
      try {
        const date = new Date(match.StartTime);
        const hour = date.getHours();
        counts[hour] = (counts[hour] || 0) + 1;
      } catch (error) {
        console.error('Erro ao processar horário:', error);
      }
    });
    return counts;
  };
  
  const matchesByHour = countMatchesByHour();
  
  return (
    <TesteContainer>
      <Title>Teste da Tabela de Jogos por Hora</Title>
      
      <ControlPanel>
        <div>
          <Button onClick={() => refetch()}>
            Atualizar Dados da API
          </Button>
        </div>
        
        <div>
          <input 
            type="checkbox" 
            id="test-mode" 
            checked={testMode} 
            onChange={handleToggleTestMode} 
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="test-mode">Filtrar por Hora</label>
        </div>
        
        {testMode && (
          <div>
            <label htmlFor="test-hour" style={{ marginRight: '8px' }}>Hora:</label>
            <Select 
              id="test-hour" 
              value={testHour} 
              onChange={handleHourChange}
            >
              {hourOptions.map(hour => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}:00 ({matchesByHour[hour] || 0} jogos)
                </option>
              ))}
            </Select>
          </div>
        )}
        
        <div>
          <strong>
            {testMode 
              ? `Exibindo ${filteredMatches.length} jogos da hora ${testHour.toString().padStart(2, '0')}:00` 
              : `Exibindo todos os ${matches.length} jogos`
            }
          </strong>
        </div>
      </ControlPanel>
      
      {loading && (
        <StatusMessage className="loading">
          Carregando dados da API...
        </StatusMessage>
      )}
      
      {error && (
        <StatusMessage className="error">
          Erro ao carregar dados: {error.message}
        </StatusMessage>
      )}
      
      {!loading && !error && matches.length === 0 && (
        <StatusMessage>
          Nenhum jogo encontrado na API. Tente atualizar os dados.
        </StatusMessage>
      )}
      
      {/* Tabela de jogos */}
      <TimeTable 
        testMode={testMode} 
        testHour={testHour}
        matches={filteredMatches}
        liga="euro"
      />
    </TesteContainer>
  );
};

export default TesteTabela; 