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