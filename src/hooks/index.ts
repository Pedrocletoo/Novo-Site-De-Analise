/**
 * Arquivo de exportação central para todos os hooks personalizados
 * Facilita a importação em outros arquivos
 */

import { useCopaAmericaTable } from './useCopaAmericaTable';
import { useTacaGloriaEternaTable } from './useTacaGloriaEternaTable';

export * from './useMatchData';
export * from './useItalianMatchData';
export * from './useItalianTimeTable';
export * from './useCopaEstrelasMatchData';
export * from './useCopaEstrelasTimeTable';

// Exportando interfaces específicas para evitar conflitos de nomes
export { useCopaAmericaTable };
export { useTacaGloriaEternaTable };

// Re-exporta hooks para uso em toda a aplicação
export { useMatchData, useMatchTime, useMatchScore } from './useMatchData';
export { useTimeTable } from './useTimeTable';
export { useCopaEstrelasMatchData } from './useCopaEstrelasMatchData';
export { useCopaEstrelasTimeTable } from './useCopaEstrelasTimeTable';
export { useItalianMatchData } from './useItalianMatchData';
export { useItalianTimeTable } from './useItalianTimeTable';
export { useCopaAmericaMatchData } from './useCopaAmericaMatchData';
export { useWebSocketData } from './useWebSocketData';
export { useNetworkStatus } from './useNetworkStatus';
export { useTableCellHighlight } from './useTableCellHighlight'; 