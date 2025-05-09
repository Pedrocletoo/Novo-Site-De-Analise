import { createGlobalStyle, DefaultTheme } from 'styled-components';

interface ThemeProps {
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

// Função auxiliar para converter hexadecimal para RGB
const hexToRgb = (hex: string) => {
  // Remover # se presente
  const cleanHex = hex.replace('#', '');
  
  // Converter para RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Retornar formato RGB
  return `${r}, ${g}, ${b}`;
};

// Definição dos temas
export const darkTheme: ThemeProps = {
  sidebar: '#112240',
  main: '#0A192F',
  secondary: '#112240',
  text: '#CCD6F6',
  textLight: '#8892B0',
  accent: '#CCFF00',
  greenCell: '#CCFF00',
  darkGreen: '#A3CC00',
  redCell: '#FF6B6B',
  grayCell: '#112240',
  border: '#112240',
  select: '#0A192F',
};

export const lightTheme: ThemeProps = {
  sidebar: '#f2f2f2',
  main: '#f7f7f7',  // Cor de fundo cinza claro (gelo)
  secondary: '#e8e8e8',
  text: '#444444',
  textLight: '#666666',
  accent: '#58745E',  // Verde mais escuro para destaque
  greenCell: '#47b14d',  // Verde da porcentagem GREEN 47.81%
  darkGreen: '#3b9040',
  redCell: '#e23838',  // Vermelho da porcentagem RED 52.19%
  grayCell: '#d0d0d0',
  border: '#cccccc',
  select: '#f0f0f0',
  tableHeader: '#6c757d',  // Cor cinza dos cabeçalhos da tabela
  percentGreen: '#81ff81',  // Verde claro para porcentagens altas (81%)
  percentRed: '#ff6b6b',   // Vermelho para porcentagens baixas
};

// Certifique-se de que ThemeProps seja compatível com DefaultTheme
export type Theme = ThemeProps;

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', Arial, Helvetica, sans-serif;
    background-color: ${({ theme }) => theme.main};
    color: ${({ theme }) => theme.text};
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    transition: all 0.3s ease;
  }

  #root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Modificando comportamento da barra de rolagem para tabelas */
  ::-webkit-scrollbar {
    height: 8px;
    width: 8px;
    background-color: ${({ theme }) => theme.main};
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.secondary};
    border-radius: 4px;
  }
  
  /* Configuração para Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.secondary} ${({ theme }) => theme.main};
  }

  /* Assegurando que elementos com a classe 'slider-control' não sejam exibidos */
  .slider-control, 
  [role="slider"], 
  input[type="range"] {
    display: none !important;
  }

  :root {
    --sidebar-background: ${({ theme }) => theme.sidebar};
    --main-background: ${({ theme }) => theme.main};
    --secondary-background: ${({ theme }) => theme.secondary};
    --text-color: ${({ theme }) => theme.text};
    --green-cell: ${({ theme }) => theme.greenCell};
    --dark-green: ${({ theme }) => theme.darkGreen};
    --red-cell: ${({ theme }) => theme.redCell};
    --gray-cell: ${({ theme }) => theme.grayCell};
    --text-light: ${({ theme }) => theme.textLight};
    --border-color: ${({ theme }) => theme.border};
    --accent-color: ${({ theme }) => theme.accent};
    --select-background: ${({ theme }) => theme.select};
    --table-header: ${({ theme }) => theme.tableHeader || theme.secondary};
    --percent-green: ${({ theme }) => theme.percentGreen || theme.greenCell};
    --percent-red: ${({ theme }) => theme.percentRed || theme.redCell};
    
    /* Valores RGB para uso em rgba() */
    --accent-color-rgb: ${({ theme }) => hexToRgb(theme.accent)};
    --green-cell-rgb: ${({ theme }) => hexToRgb(theme.greenCell)};
    --red-cell-rgb: ${({ theme }) => hexToRgb(theme.redCell)};
    --text-color-rgb: ${({ theme }) => hexToRgb(theme.text)};
    --border-color-rgb: ${({ theme }) => hexToRgb(theme.border)};
  }
`;

export default GlobalStyle; 