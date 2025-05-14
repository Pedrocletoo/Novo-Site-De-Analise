import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavItem } from './styles';
import { RouteConfig } from './routes';

interface NavigationItemProps {
  route: RouteConfig;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ route }) => {
  return (
    <NavItem key={route.path}>
      <NavLink to={route.path} end={route.exact}>
        {route.label}
      </NavLink>
    </NavItem>
  );
};

export default NavigationItem; 