import React from 'react';
import { Navigation as Nav } from './styles';
import NavigationItem from './NavigationItem';
import { NAVIGATION_ROUTES } from './routes';

const Navigation: React.FC = () => {
  return (
    <Nav>
      {NAVIGATION_ROUTES.map((route) => (
        <NavigationItem key={route.path} route={route} />
      ))}
    </Nav>
  );
};

export default Navigation; 