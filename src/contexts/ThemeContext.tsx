import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import GlobalStyle, { darkTheme, lightTheme } from '../styles/globalStyles';

type ThemeContextType = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

// Criação do contexto com valores padrão
const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: true,
  toggleTheme: () => {},
});

// Hook personalizado para facilitar o acesso ao contexto
export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Verificar se há preferência salva no localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Padrão é tema escuro
  });

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // Salvar preferência no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    
    // Atualizar a classe no elemento html para CSS global
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  // Selecionar o tema atual baseado no estado
  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 