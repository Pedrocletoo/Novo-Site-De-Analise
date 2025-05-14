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
  { path: '/tabela-horarios', label: 'Tabela de Horários', exact: false },
  { path: '/teste-tabela', label: 'Testar Tabela', exact: false },
  { path: '/teste-tabela-detalhes', label: 'Teste Tabela Detalhada', exact: false },
  { path: '/criar-bots', label: 'Criar Bots', exact: false }
]; 