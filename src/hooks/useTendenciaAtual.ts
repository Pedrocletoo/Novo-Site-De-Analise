import { useState, useEffect } from 'react';
import { IMinute } from '../components/leagues/shared/BaseLeagueTable';
import { IMatch } from '../services/api';
import { TimeFilterOption } from '../components/Filters/common/TimeFilter';
import { IMatchRenderOptions, getCellColor, isHomeWin } from '../components/leagues/shared/BaseLeagueTable';
import { TableCell, calculateRowStats } from '../utils/tableStats';

export interface TendenciaAtual {
  texto: string;
  cor: string;
  piscar: boolean;
  greenPercentage: number;
}

/**
 * Hook personalizado para calcular a tendência atual com base nos dados de partidas
 */
export const useTendenciaAtual = (
  filteredHours: number[],
  matches: IMatch[],
  minutes: IMinute[],
  cells: Record<string, { matches: IMatch[] }>,
  timeFilter: TimeFilterOption,
  finalRenderOptions: IMatchRenderOptions
): TendenciaAtual => {
  const [tendencia, setTendencia] = useState<TendenciaAtual>({
    texto: "Calculando...",
    cor: "#888888",
    piscar: false,
    greenPercentage: 0
  });

  useEffect(() => {
    if (filteredHours.length === 0 || matches.length === 0) return;

    // Função para calcular a tendência com base nos dados atuais
    const calcularTendencia = () => {
      // Obter a hora atual (primeira hora na lista filtrada)
      const horaAtual = filteredHours[0];
      
      // Array para armazenar informações das células para estatísticas
      const rowCells: TableCell[] = [];
      
      // Coletar células da hora atual
      minutes.forEach(minute => {
        const cellKey = `${horaAtual}:${parseInt(minute.value)}`;
        const cellData = cells[cellKey];
        
        if (!cellData || cellData.matches.length === 0) {
          // Adicionar célula vazia para estatísticas
          rowCells.push({
            isEmpty: true,
            color: 'white'
          });
        } else {
          // Pegar o primeiro jogo da célula
          const match = cellData.matches[0];
          
          // Determinar qual pontuação usar com base no filtro de tempo
          let homeScore = 0;
          let awayScore = 0;
          
          if (timeFilter === 'HT') {
            homeScore = parseInt(match.HalfTimeHomeTeam) || 0;
            awayScore = parseInt(match.HalfTimeAwayTeam) || 0;
          } else {
            homeScore = parseInt(match.FullTimeHomeTeam) || 0;
            awayScore = parseInt(match.FullTimeAwayTeam) || 0;
          }
          
          const homeWin = isHomeWin(homeScore, awayScore);
          
          // Determinar a cor da célula
          const cellColor = getCellColor(homeWin, match, finalRenderOptions, timeFilter);
          
          // Adicionar célula para estatísticas
          rowCells.push({
            isEmpty: false,
            color: cellColor.color as any,
            match
          });
        }
      });
      
      // Verificar se há pelo menos 6 jogos com dados (não vazios)
      const celulasComDados = rowCells.filter(cell => !cell.isEmpty);
      
      if (celulasComDados.length < 6) {
        // Se não houver pelo menos 6 jogos, mostrar "Aguardando tendência"
        setTendencia({
          texto: "Aguardando tendência",
          cor: "#888888",
          piscar: false,
          greenPercentage: 0
        });
        return;
      }
      
      // Calcular estatísticas para esta linha
      const stats = calculateRowStats(rowCells);
      
      // Usar a porcentagem real da primeira linha
      const greenPercentage = stats.greenPercentage;
      
      // Definir a tendência com base na porcentagem
      if (greenPercentage <= 30) {
        setTendencia({
          texto: "Grande chance de Ambas Sim",
          cor: "#00cc00",
          piscar: true,
          greenPercentage: greenPercentage
        });
      } else if (greenPercentage >= 31 && greenPercentage <= 40) {
        setTendencia({
          texto: "Pode sair Ambas Sim",
          cor: "#00cc00",
          piscar: false,
          greenPercentage: greenPercentage
        });
      } else if (greenPercentage >= 41 && greenPercentage <= 59) {
        setTendencia({
          texto: "Mercado Lateralizado. Cuidado!",
          cor: "#ff9900",
          piscar: false,
          greenPercentage: greenPercentage
        });
      } else if (greenPercentage >= 60) {
        setTendencia({
          texto: "Grande chance de Ambas Não",
          cor: "#ff0000",
          piscar: true,
          greenPercentage: greenPercentage
        });
      }
    };
    
    // Executa o cálculo de tendência
    calcularTendencia();
    
  }, [filteredHours, matches, minutes, cells, timeFilter]);

  return tendencia;
}; 