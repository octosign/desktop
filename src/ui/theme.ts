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
  shape: {
    borderRadius: 16,
  },
});

export default theme;
