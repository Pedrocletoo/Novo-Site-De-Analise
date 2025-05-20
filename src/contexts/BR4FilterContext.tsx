// Arquivo mantido para compatibilidade com código existente
// Este arquivo agora apenas reexporta o novo contexto BR4 dos componentes organizados

export {
  BR4FilterProvider,
  useBR4FilterContext
} from '../components/Filters/br4/BR4FilterContext';

export {
  availableLeagues,
  availableMarkets
} from '../components/Filters/common/types';

export type {
  MarketFilterType,
  MarketFilterState
} from '../components/Filters/common/types'; 