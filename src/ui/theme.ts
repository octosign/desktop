import { createMuiTheme } from '@material-ui/core/styles';
import { green, deepOrange } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1A1F33',
    },
    secondary: {
      main: '#0066FF',
    },
    success: {
      main: green[500],
      contrastText: '#fff',
    },
    warning: {
      main: deepOrange[500],
      contrastText: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
