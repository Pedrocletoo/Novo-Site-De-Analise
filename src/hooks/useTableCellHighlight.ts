import { useState, useCallback } from 'react';

interface TableCellHighlightState {
  rowIndex: number | null;
  columnIndex: number | null;
}

export function useTableCellHighlight() {
  const [highlight, setHighlight] = useState<TableCellHighlightState>({
    rowIndex: null,
    columnIndex: null,
  });

  const setHighlightCell = useCallback((rowIndex: number | null, columnIndex: number | null) => {
    setHighlight({ rowIndex, columnIndex });
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlight({ rowIndex: null, columnIndex: null });
  }, []);

  return {
    highlight,
    setHighlightCell,
    clearHighlight,
  };
}

// Garantindo que este arquivo seja tratado como um módulo
export default useTableCellHighlight; 