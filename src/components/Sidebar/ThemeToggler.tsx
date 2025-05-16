import React from 'react';
import { ThemeToggleContainer, ThemeToggleButton } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggler: React.FC = () => {
  const { isDarkTheme, toggleTheme } = useTheme();
  
  return (
    <ThemeToggleContainer>
      <ThemeToggleButton onClick={toggleTheme}>
        {isDarkTheme ? (
          <>
            <span role="img" aria-label="sol" style={{ marginRight: '8px' }}>☀️</span>
            Ativar Tema Claro
          </>
        ) : (
          <>
            <span role="img" aria-label="lua" style={{ marginRight: '8px' }}>🌙</span>
            Ativar Tema Escuro
          </>
        )}
      </ThemeToggleButton>
    </ThemeToggleContainer>
  );
};

export default ThemeToggler; 