export interface RouteConfig {
  path: string;
  label: string;
  exact: boolean;
}

export const NAVIGATION_ROUTES: RouteConfig[] = [
  { path: '/', label: 'Dashboard', exact: true },
  { path: '/futebol-virtual', label: 'Futebol Virtual', exact: false },
  { path: '/partidas', label: 'Dados de Partidas', exact: false },
  { path: '/filtrar-partidas', label: 'Filtrar Partidas', exact: false },
  { path: '/criar-bots', label: 'Criar Bots', exact: false }
]; 