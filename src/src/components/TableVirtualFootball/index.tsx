import React, { useEffect, useState } from 'react';
import { useFilterContext } from '../Filters';

/**
 * REGRAS IMPORTANTES:
 * 
 * 1. ESTRUTURA DA TABELA:
 *    - MINUTOS: Estão no cabeçalho horizontal (parte superior da tabela)
 *      Valores como 01, 04, 07, 10, 13, etc.
 * 
 *    - HORAS: Estão na coluna vertical (primeira coluna à esquerda)
 *      Valores como 22, 21, 20, 19, 18, etc.
 * 
 * 2. QUALQUER ALTERAÇÃO DEVE MANTER ESTA CONVENÇÃO
 */

import { 
  TableContainer, 
  Table, 
  HeaderRow, 
  HeaderCell, 
  DataRow, 
  DataCell, 
  Score, 
  SummaryCell, 
  MinuteCell, 
  HourCell,
  GreenPercentage 
} from './styles';
import { CellColorProps } from './types';

// Interface para os minutos no cabeçalho horizontal
interface IMinute {
  value: string;
}

// Interface para os percentuais de cabeçalho
interface IHeaderPercentage {
  value: string;
  fraction: string;
  color?: 'green' | 'red';
}

// Interface para os dados de linha
interface IRowData {
  hour: number;
  percentage: number;
  greens: number;
  totalGames: number;
}

// Definição dos minutos no cabeçalho horizontal
const minutes: IMinute[] = [
  { value: '01' }, { value: '04' }, { value: '07' }, { value: '10' },
  { value: '13' }, { value: '16' }, { value: '19' }, { value: '22' },
  { value: '25' }, { value: '28' }, { value: '31' }, { value: '34' },
  { value: '37' }, { value: '40' }, { value: '43' }, { value: '46' },
  { value: '49' }, { value: '52' }, { value: '55' }, { value: '58' }
];

// Definição dos percentuais de cabeçalho
const headerPercentages: IHeaderPercentage[] = [
  { value: '42%', fraction: '(5/12)' },
  { value: '42%', fraction: '(5/12)' },
  { value: '58%', fraction: '(7/12)', color: 'green' },
  { value: '42%', fraction: '(5/12)' },
  { value: '42%', fraction: '(5/12)' },
  { value: '58%', fraction: '(7/12)', color: 'green' },
  { value: '42%', fraction: '(5/12)' },
  { value: '67%', fraction: '(8/12)', color: 'green' },
  { value: '33%', fraction: '(4/12)', color: 'red' },
  { value: '58%', fraction: '(7/12)', color: 'green' },
  { value: '25%', fraction: '(3/12)', color: 'red' },
  { value: '50%', fraction: '(6/12)' },
  { value: '50%', fraction: '(6/12)' },
  { value: '50%', fraction: '(6/12)' },
  { value: '33%', fraction: '(4/12)', color: 'red' },
  { value: '50%', fraction: '(6/12)' },
  { value: '67%', fraction: '(8/12)', color: 'green' },
  { value: '50%', fraction: '(6/12)' },
  { value: '50%', fraction: '(6/12)' },
  { value: '45%', fraction: '(5/11)' }
];

// Dados estáticos das estatísticas (mantidos separados das horas para facilitar a atualização)
const staticData = [
  { percentage: 19, greens: 4, totalGames: 41 },
  { percentage: 55, greens: 26, totalGames: 127 },
  { percentage: 53, greens: 32, totalGames: 156 },
  { percentage: 47, greens: 28, totalGames: 139 },
  { percentage: 42, greens: 20, totalGames: 110 },
  { percentage: 55, greens: 21, totalGames: 106 },
  { percentage: 50, greens: 20, totalGames: 102 },
  { percentage: 48, greens: 19, totalGames: 101 },
  { percentage: 50, greens: 20, totalGames: 101 },
  { percentage: 40, greens: 16, totalGames: 87 },
  { percentage: 43, greens: 17, totalGames: 86 },
  { percentage: 45, greens: 18, totalGames: 100 }
];

// Função para determinar a cor da célula - sempre retorna cinza para manter consistência
const getCellColor = (): CellColorProps => {
  return { color: 'gray' };
};

/**
 * Componente de Tabela de Futebol Virtual
 * Exibe dados de jogos em uma tabela formatada
 */
const TableVirtualFootball: React.FC = () => {
  // Estado para armazenar os dados de linha com horas atualizadas
  const [rowsData, setRowsData] = useState<IRowData[]>([]);
  
  // Acesso ao contexto de filtro para obter o número de horas selecionado
  const { hoursFilter } = useFilterContext();

  // Atualiza as horas com base na hora atual do sistema
  useEffect(() => {
    const updateHours = () => {
      const currentHour = new Date().getHours();
      
      // Cria um array de dados com 36 horas completas para garantir que temos dados suficientes
      // independentemente do filtro selecionado (incluindo o novo filtro de 36 horas)
      const updatedRowsData = Array.from({ length: 36 }, (_, index) => {
        // Calcula a hora para esta linha (decrescente a partir da hora atual)
        let hour = currentHour - index;
        
        // Ajusta caso a hora fique negativa ou igual a 24 (formato 0-23)
        if (hour < 0) {
          // Garante que o resultado esteja no intervalo de 0 a 23
          hour = ((hour % 24) + 24) % 24;
        } else if (hour === 24) {
          hour = 0;
        }
        
        // Associa os dados estáticos disponíveis, ou usa valores padrão caso não existam
        const dataIndex = index % staticData.length;
        const data = staticData[dataIndex];
        
        return {
          hour,
          ...data
        };
      });
      
      // Filtra os dados com base no filtro de horas selecionado
      const filteredRowsData = updatedRowsData.slice(0, hoursFilter);
      
      setRowsData(filteredRowsData);
    };
    
    // Atualiza as horas imediatamente e configura um intervalo para atualizar a cada minuto
    updateHours();
    const interval = setInterval(updateHours, 60000);
    
    return () => clearInterval(interval);
  }, [hoursFilter]); // Adiciona hoursFilter como dependência para re-executar quando o filtro mudar

  // Remove qualquer controle deslizante que possa ser adicionado dinamicamente
  useEffect(() => {
    const removeSliders = () => {
      const sliders = document.querySelectorAll('input[type="range"], [role="slider"], .scrubber, .progress-bar, .slider');
      sliders.forEach(slider => {
        if (slider instanceof HTMLElement) {
          slider.style.display = 'none';
        }
      });
    };

    // Executa na montagem e a cada 500ms
    removeSliders();
    const interval = setInterval(removeSliders, 500);

    return () => clearInterval(interval);
  }, []);

  // Renderiza o cabeçalho de percentuais
  const renderPercentageHeader = () => (
    <HeaderRow>
      <HeaderCell>%</HeaderCell>
      {headerPercentages.map((item, index) => (
        <HeaderCell key={`perc-${index}`} $color={item.color}>
          {item.value}
          <small>{item.fraction}</small>
        </HeaderCell>
      ))}
      {/* Células vazias para fechar a tabela após o 45% */}
      <HeaderCell></HeaderCell>
      <HeaderCell></HeaderCell>
      <HeaderCell></HeaderCell>
    </HeaderRow>
  );

  // Renderiza o cabeçalho de minutos (horizontal)
  const renderMinutesHeader = () => (
    <HeaderRow>
      <HeaderCell>Hora<br/>Minuto</HeaderCell>
      {minutes.map((minute, index) => (
        <MinuteCell key={`minute-${index}`}>{minute.value}</MinuteCell>
      ))}
      <HeaderCell>%</HeaderCell>
      <HeaderCell>Greens</HeaderCell>
      <HeaderCell>Σ</HeaderCell>
    </HeaderRow>
  );

  // Renderiza as células vazias com "-" para cada linha
  const renderEmptyCells = () => (
    Array(20).fill(0).map((_, index) => (
      <DataCell key={`cell-${index}`} {...getCellColor()}>
        <Score>{'-'}</Score>
      </DataCell>
    ))
  );

  // Renderiza uma linha de dados com hora na vertical (primeira coluna)
  const renderDataRow = (rowData: IRowData, index: number) => (
    <DataRow key={`row-${index}`}>
      <HourCell>{rowData.hour}</HourCell>
      {renderEmptyCells()}
      <SummaryCell>
        <GreenPercentage $percentage={rowData.percentage}>{rowData.percentage}%</GreenPercentage>
      </SummaryCell>
      <SummaryCell>{rowData.greens}</SummaryCell>
      <SummaryCell>{rowData.totalGames}</SummaryCell>
    </DataRow>
  );

  return (
    <TableContainer>
      <Table>
        <thead>
          {renderPercentageHeader()}
          {renderMinutesHeader()}
        </thead>
        <tbody>
          {rowsData.map((rowData, index) => renderDataRow(rowData, index))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default TableVirtualFootball; 