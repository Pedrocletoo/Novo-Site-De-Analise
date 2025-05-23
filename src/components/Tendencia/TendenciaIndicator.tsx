import React from 'react';
import BlinkingText from '../common/BlinkingText';
import { useTendenciaAtual } from '../../hooks/useTendenciaAtual';
import { IMinute, IMatchRenderOptions } from '../shared/TimeFilterTypes';
import { IMatch } from '../../services/api';
import { TimeFilterOption } from '../Filters/common/TimeFilter';
import { useFilterContext } from '../Filters';

interface TendenciaIndicatorProps {
  filteredHours: number[];
  matches: IMatch[];
  minutes: IMinute[];
  cells: Record<string, { matches: IMatch[] }>;
  timeFilter: TimeFilterOption;
  renderOptions: IMatchRenderOptions;
}

/**
 * Componente que exibe o indicador de tendência atual
 * Visível quando o filtro "Ambas Marcam - Sim" ou "Ambas Marcam - Não" estiver ativo
 * Com lógicas invertidas para cada caso
 */
const TendenciaIndicator: React.FC<TendenciaIndicatorProps> = ({
  filteredHours,
  matches,
  minutes,
  cells,
  timeFilter,
  renderOptions
}) => {
  // Obtém o estado atual dos filtros
  const { marketFilters } = useFilterContext();
  
  // Calcula a tendência sempre, independente do filtro estar ativo ou não
  const tendencia = useTendenciaAtual(
    filteredHours,
    matches,
    minutes,
    cells,
    timeFilter,
    renderOptions
  );
  
  // Verifica se o filtro "Ambas Marcam" está ativo
  const ambasMarcamAtivo = marketFilters.ambasMarcam.active;
  
  // Verifica o valor do filtro (sim ou não)
  const ambasMarcamValor = marketFilters.ambasMarcam.value;
  
  // Se o filtro não estiver ativo, não renderiza nada
  if (!ambasMarcamAtivo) {
    return null;
  }

  // Determina o texto e o estilo da tendência com base no valor do filtro
  let tendenciaTexto = '';
  let tendenciaCor = '';
  let tendenciaPiscar = false;
  
  // Verifica se a tendência está no estado de "Aguardando tendência"
  // Isso ocorre quando não há pelo menos 6 jogos disponíveis
  const aguardandoTendencia = tendencia.texto === "Aguardando tendência";
  
  if (aguardandoTendencia) {
    // Se estiver aguardando tendência, mostrar o mesmo texto independente do filtro
    tendenciaTexto = tendencia.texto;
    tendenciaCor = tendencia.cor;
    tendenciaPiscar = tendencia.piscar;
  } else if (ambasMarcamValor === 'sim') {
    // Regras para "Ambas Marcam - Sim" (mantém a lógica original)
    // =< 30% = Grande chance de Ambas Sim
    // 31 a 40% = Pode sair Ambas Sim
    // 41 a 59% = Mercado Lateralizado. Cuidado!
    // 60% => = Grande chance de Ambas Não
    tendenciaTexto = tendencia.texto;
    tendenciaCor = tendencia.cor;
    tendenciaPiscar = tendencia.piscar;
  } else if (ambasMarcamValor === 'nao') {
    // Regras para "Ambas Marcam - Não" (invertendo a lógica)
    // Inversão correta da lógica:
    // =< 30% = Grande chance de Ambas Não (a mesma cor que >= 60% para SIM)
    // 31 a 40% = Pode sair Ambas Não (a mesma cor que 31-40% para SIM)
    // 41 a 59% = Mercado Lateralizado. Cuidado! (mesma para ambos)
    // >= 60% = Grande chance de Ambas Sim (a mesma cor que <= 30% para SIM)
    
    const greenPercentage = tendencia.greenPercentage;
    
    // Para "Ambas Marcam - Não", a lógica de alta % verde é que tem mais chances de ambas marcarem (não queremos)
    // E baixa % verde significa mais chances de não marcarem (queremos)
    if (greenPercentage >= 60) {
      tendenciaTexto = "Grande chance de Ambas Sim";
      tendenciaCor = "#00cc00"; // verde
      tendenciaPiscar = true;
    } else if (greenPercentage >= 41 && greenPercentage <= 59) {
      tendenciaTexto = "Mercado Lateralizado. Cuidado!";
      tendenciaCor = "#ff9900"; // laranja
      tendenciaPiscar = false;
    } else if (greenPercentage >= 31 && greenPercentage <= 40) {
      tendenciaTexto = "Pode sair Ambas Não";
      tendenciaCor = "#ff0000"; // vermelho
      tendenciaPiscar = false;
    } else if (greenPercentage <= 30) {
      tendenciaTexto = "Grande chance de Ambas Não";
      tendenciaCor = "#ff0000"; // vermelho
      tendenciaPiscar = true;
    }
  }

  return (
    <>
      <div style={{ marginLeft: '15px', borderLeft: '1px solid lime', height: '20px' }}></div>
      <span style={{ marginLeft: '15px', marginRight: '8px', fontWeight: 'bold' }}>Tendência Atual:</span>
      <BlinkingText 
        text={tendenciaTexto} 
        color={tendenciaCor} 
        shouldBlink={tendenciaPiscar} 
      />
    </>
  );
};

export default TendenciaIndicator; 