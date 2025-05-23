import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NavItem, SubMenu } from './styles';
import { RouteConfig } from './routes';

interface NavigationItemProps {
  route: RouteConfig;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ route }) => {
  const [expanded, setExpanded] = useState(route.expanded || false);
  
  const toggleExpand = (e: React.MouseEvent) => {
    if (route.subRoutes && route.subRoutes.length > 0) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <NavItem key={route.path}>
      <NavLink 
        to={route.subRoutes && route.subRoutes.length > 0 ? "#" : route.path} 
        className={({ isActive }) => isActive ? "active" : ""}
        onClick={toggleExpand}
        end={route.exact}
      >
        {route.label}
        {route.subRoutes && route.subRoutes.length > 0 && (
          <span className="arrow">{expanded ? '▼' : '▶'}</span>
        )}
      </NavLink>
      
      {route.subRoutes && route.subRoutes.length > 0 && expanded && (
        <SubMenu>
          {route.subRoutes.map((subRoute) => (
            <NavItem key={subRoute.path} className="sub-item">
              <NavLink 
                to={subRoute.path} 
                className={({ isActive }) => isActive ? "active" : ""}
                end={subRoute.exact}
              >
                {subRoute.label}
              </NavLink>
            </NavItem>
          ))}
        </SubMenu>
      )}
    </NavItem>
  );
};

export default NavigationItem; 