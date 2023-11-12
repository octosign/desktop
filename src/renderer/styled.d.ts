// import original module declaration
import 'styled-components';
import { Theme } from '@material-ui/core/styles/createTheme';

// and extend it
declare module 'styled-components' {
  export type DefaultTheme = Theme;
}
