/**
 * Arquivo de exportação central para todos os hooks personalizados
 * Facilita a importação em outros arquivos
 */

import { useCopaAmericaTable } from './useCopaAmericaTable';
import { useTacaGloriaEternaTable } from './useTacaGloriaEternaTable';

export * from './useMatchData';
export * from './useCopaEstrelasMatchData';
export * from './useCopaAmericaMatchData';
export * from './useWebSocketData';
export * from './useProcessedTableData';

// Re-exporta hooks para uso em toda a aplicação
export { useMatchData, useMatchTime, useMatchScore } from './useMatchData';
export { useCopaAmericaTable, useTacaGloriaEternaTable };

// Importações restantes
export { useItalianMatchData } from './useItalianMatchData';
export { useItalianTimeTable } from './useItalianTimeTable'; 