/**
 * Declarações de tipos globais
 */

// Declaração para importações de arquivos de estilo
declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.sass' {
  const content: any;
  export default content;
}

// Declaração para importações de imagens
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

// Extensão de interfaces nativas
interface Window {
  // Adicione quaisquer propriedades globais da janela aqui
}

// Declaração para variáveis CSS
interface CSSVariables {
  '--main-background': string;
  '--secondary-background': string;
  '--text-color': string;
  '--text-light': string;
  '--accent-color': string;
  '--green-cell': string;
  '--red-cell': string;
  '--select-background': string;
  '--sidebar-background': string;
}

// Exporte tipos comumente usados para reutilização
export type ColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; 