import 'styled-components';
import { Theme } from './styles/globalStyles';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
} 