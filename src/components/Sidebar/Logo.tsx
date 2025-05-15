import React from 'react';
import { Logo as LogoText, LogoContainer } from './styles';

interface LogoProps {
  title?: string;
}

const Logo: React.FC<LogoProps> = ({ title = 'Análise Virtual' }) => {
  return (
    <LogoContainer>
      <LogoText>{title}</LogoText>
    </LogoContainer>
  );
};

export default Logo; 