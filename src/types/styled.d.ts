import 'styled-components';
import { Theme } from '../styles/globalStyles';

declare module 'styled-components' {
  export interface DefaultTheme {
    sidebar: string;
    main: string;
    secondary: string;
    text: string;
    textLight: string;
    accent: string;
    greenCell: string;
    darkGreen: string;
    redCell: string;
    grayCell: string;
    border: string;
    select: string;
    tableHeader?: string;
    percentGreen?: string;
    percentRed?: string;
  }

  export const css: any;
  export const createGlobalStyle: any;

  // Tipo principal do styled
  export default interface styled {
    // Métodos para criar componentes estilizados
    div: any;
    span: any;
    main: any;
    header: any;
    footer: any;
    section: any;
    article: any;
    aside: any;
    nav: any;
    ul: any;
    ol: any;
    li: any;
    a: any;
    button: any;
    input: any;
    form: any;
    label: any;
    select: any;
    option: any;
    textarea: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    p: any;
    table: any;
    tr: any;
    td: any;
    th: any;
    thead: any;
    tbody: any;
    tfoot: any;
    img: any;

    // Método para estilizar componentes existentes
    (component: any): any;
  }

  export interface StyledComponent<T = any, S = any> {
    (props: any): JSX.Element;
    withConfig: any;
    attrs: any;
  }

  export interface Keyframes {
    name: string;
    rules: string;
  }
} 