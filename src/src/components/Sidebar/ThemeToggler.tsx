import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeToggleContainer, ThemeToggleButton } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggler: React.FC = () => {
  const { isDarkTheme, toggleTheme } = useTheme();
  
  return (
    <ThemeToggleContainer>
      <ThemeToggleButton onClick={toggleTheme}>
        {isDarkTheme ? (
          <>
            <FiSun size={16} />
            Ativar Tema Claro
          </>
        ) : (
          <>
            <FiMoon size={16} />
            Ativar Tema Escuro
          </>
        )}
      </ThemeToggleButton>
    </ThemeToggleContainer>
  );
};

export default ThemeToggler; 