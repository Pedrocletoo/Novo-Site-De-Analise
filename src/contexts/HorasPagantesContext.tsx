import React, { createContext, useContext, useState } from 'react';

interface HorasPagantesContextType {
  horasPagantesAtivo: boolean;
  setHorasPagantesAtivo: React.Dispatch<React.SetStateAction<boolean>>;
}

const HorasPagantesContext = createContext<HorasPagantesContextType | undefined>(undefined);

export const HorasPagantesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [horasPagantesAtivo, setHorasPagantesAtivo] = useState(false);

  return (
    <HorasPagantesContext.Provider value={{ horasPagantesAtivo, setHorasPagantesAtivo }}>
      {children}
    </HorasPagantesContext.Provider>
  );
};

export const useHorasPagantes = (): HorasPagantesContextType => {
  const context = useContext(HorasPagantesContext);
  if (context === undefined) {
    throw new Error('useHorasPagantes deve ser usado dentro de um HorasPagantesProvider');
  }
  return context;
}; 