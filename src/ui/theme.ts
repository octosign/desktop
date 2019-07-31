import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0B5369',
    },
    secondary: {
      main: '#1B9AAA',
    },
  },
  spacing: factor => `${0.5 * factor}rem`,
  shape: {
    borderRadius: 16,
  },
});

export default theme;
