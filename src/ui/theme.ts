import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1A1F33',
    },
    secondary: {
      main: '#0066FF',
    },
  },
  spacing: factor => `${0.5 * factor}rem`,
  shape: {
    borderRadius: 16,
  },
});

export default theme;
