import React, { useState } from 'react';
import { useMatchData } from '../hooks';
import { IMatch } from '../services/api';
import TimeTable from './TimeTable';
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
`;

const HourGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fafafa;
`;

const GroupTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #1a2140;
  font-size: 13px;
`;

const CheckboxLabel = styled.label<{ hasGames?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
  
  ${({ hasGames }) => hasGames && `
    font-weight: bold;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
  `}
  
  input {
    margin-right: 6px;
  }
`;

/**
 * Página para testar a visualização da tabela com dados da API
 */
const TesteTabela: React.FC = () => {
  // Buscar dados da API
  const { matches, loading, error, refetch } = useMatchData();
  
  // Estados para controlar a exibição da tabela
  const [testMode, setTestMode] = useState<boolean>(true);
  
  // Organizando as horas na ordem correta, incluindo a hora 17
  const initialHours = [
    17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 
    23, 22, 21, 20, 19, 18
  ];

  // Novas horas múltiplas pré-selecionadas na ordem decrescente correta
  const [selectedHours, setSelectedHours] = useState<number[]>(initialHours);
  
  // Estado para controle de uma única hora (para compatibilidade com o componente TimeTable)
  const [testHour, setTestHour] = useState<number>(23);
  
  // Verificar se deve mostrar múltiplas horas ou apenas uma
  const [showMultipleHours, setShowMultipleHours] = useState<boolean>(true);
  
  // Gerar opções de horas para o seletor
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Atualizar a hora de teste selecionada (para modo de hora única)
  const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTestHour(Number(event.target.value));
  };
  
  // Alternar modo de teste
  const handleToggleTestMode = () => {
    setTestMode(!testMode);
  };
  
  // Alternar entre visualização de hora única ou múltiplas horas
  const handleToggleMultiHours = () => {
    setShowMultipleHours(!showMultipleHours);
  };
  
  // Manipular a seleção de horas no modo de múltiplas horas
  const handleHourSelection = (hour: number) => {
    if (selectedHours.includes(hour)) {
      // Remover hora se já estiver selecionada
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      // Adicionar hora se não estiver selecionada
      const newHours = [...selectedHours, hour];
      
      // Organizar as horas na ordem correta da tabela
      const hoursBelow18 = newHours.filter(h => h <= 17).sort((a, b) => b - a);
      const hoursAbove17 = newHours.filter(h => h > 17).sort((a, b) => b - a);
      
      setSelectedHours([...hoursBelow18, ...hoursAbove17]);
    }
  };
  
  // Filtrar jogos por horas específicas
  const filteredMatches = testMode 
    ? matches.filter(match => {
        try {
          const date = new Date(match.StartTime);
          const hour = date.getHours();
          
          if (showMultipleHours) {
            // Filtrar por todas as horas selecionadas
            return selectedHours.includes(hour);
          } else {
            // Filtrar por uma única hora
            return hour === testHour;
          }
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
          <>
            <div>
              <input 
                type="checkbox" 
                id="multi-hours" 
                checked={showMultipleHours} 
                onChange={handleToggleMultiHours} 
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="multi-hours">Múltiplas Horas</label>
            </div>
            
            {showMultipleHours ? (
              <HourGroups>
                <GroupTitle>Selecione as horas para visualizar:</GroupTitle>
                
                <CheckboxGroup>
                  <GroupTitle>Horas (17-0):</GroupTitle>
                  {[17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(hour => (
                    <CheckboxLabel key={hour} hasGames={Boolean(matchesByHour[hour] && matchesByHour[hour] > 0)}>
                      <input 
                        type="checkbox" 
                        checked={selectedHours.includes(hour)} 
                        onChange={() => handleHourSelection(hour)} 
                      />
                      {hour.toString().padStart(2, '0')}:00 ({matchesByHour[hour] || 0})
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
                
                <CheckboxGroup>
                  <GroupTitle>Horas (23-18):</GroupTitle>
                  {[23, 22, 21, 20, 19, 18].map(hour => (
                    <CheckboxLabel key={hour} hasGames={Boolean(matchesByHour[hour] && matchesByHour[hour] > 0)}>
                      <input 
                        type="checkbox" 
                        checked={selectedHours.includes(hour)} 
                        onChange={() => handleHourSelection(hour)} 
                      />
                      {hour.toString().padStart(2, '0')}:00 ({matchesByHour[hour] || 0})
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Button onClick={() => setSelectedHours([...initialHours])}>
                    Selecionar Todas
                  </Button>
                  <Button onClick={() => setSelectedHours([])}>
                    Limpar Seleção
                  </Button>
                  <Button onClick={() => setSelectedHours([17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0])}>
                    Selecionar 17-00h
                  </Button>
                  <Button onClick={() => setSelectedHours([23, 22, 21, 20, 19, 18])}>
                    Selecionar 23-18h
                  </Button>
                </div>
              </HourGroups>
            ) : (
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
          </>
        )}
        
        <div>
          <strong>
            {testMode 
              ? showMultipleHours
                ? `Exibindo ${filteredMatches.length} jogos das horas ${selectedHours.map(h => h.toString().padStart(2, '0')).join(', ')}`
                : `Exibindo ${filteredMatches.length} jogos da hora ${testHour.toString().padStart(2, '0')}:00`
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
        testHour={showMultipleHours ? undefined : testHour}
        matches={filteredMatches}
        liga="euro"
        selectedHours={showMultipleHours ? selectedHours : undefined}
      />
    </TesteContainer>
  );
};

export default TesteTabela; 