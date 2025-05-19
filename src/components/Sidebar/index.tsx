import React from 'react';
import { SidebarContainer } from './styles';
import ThemeToggler from './ThemeToggler';
import Logo from './Logo';
import Navigation from './Navigation';

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <Logo />
      <Navigation />
      <ThemeToggler />
    </SidebarContainer>
  );
};

export default Sidebar; 