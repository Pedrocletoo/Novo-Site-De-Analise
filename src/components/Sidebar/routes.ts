export interface RouteConfig {
  path: string;
  label: string;
  exact: boolean;
  subRoutes?: RouteConfig[];
  expanded?: boolean;
}

export const NAVIGATION_ROUTES: RouteConfig[] = [
  { path: '/', label: 'Dashboard', exact: true },
  { 
    path: '/futebol-virtual', 
    label: 'Futebol Virtual', 
    exact: false,
    subRoutes: [
      { path: '/futebol-virtual/betano', label: 'Betano', exact: false },
      { path: '/futebol-virtual/br4', label: 'Br4', exact: false },
    ],
    expanded: true
  },
  { path: '/partidas', label: 'Dados de Partidas', exact: false },
  { path: '/filtrar-partidas', label: 'Filtrar Partidas', exact: false },
  { path: '/criar-bots', label: 'Criar Bots', exact: false }
]; 