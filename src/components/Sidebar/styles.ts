import styled from 'styled-components';

export const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: var(--sidebar-background);
  border-right: 1px solid var(--border-color);
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  
  @media (max-width: 768px) {
    width: 200px;
    transform: translateX(-100%);
    transition: transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

export const LogoContainer = styled.div`
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
  transition: border-color 0.3s ease;
`;

export const Logo = styled.h1`
  font-size: 20px;
  color: var(--accent-color);
  font-weight: 700;
  transition: color 0.3s ease;
`;

export const Navigation = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

export const NavItem = styled.li`
  a {
    display: block;
    padding: 12px 20px;
    color: var(--text-light);
    text-decoration: none;
    font-size: 16px;
    transition: all 0.3s ease;
    position: relative;
    
    &:hover, &.active {
      background-color: var(--secondary-background);
      opacity: 0.9;
      color: var(--accent-color);
    }

    &.active {
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background-color: var(--accent-color);
        transition: background-color 0.3s ease;
      }
    }
    
    .arrow {
      float: right;
      font-size: 12px;
      margin-top: 4px;
    }
  }
  
  &.sub-item {
    a {
      padding-left: 35px;
      font-size: 14px;
    }
  }
`;

export const ThemeToggleContainer = styled.div`
  padding: 20px;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
`;

export const ThemeToggleButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: var(--secondary-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent-color);
    color: #ffffff;
  }
  
  svg {
    margin-right: 8px;
  }
`;

export const SubMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.1);
`; 