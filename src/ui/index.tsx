import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import 'typeface-roboto';

import theme from './theme';
import App from './components/App';
import { ThemeProvider } from 'styled-components';

ReactDOM.render(
  <>
    <CssBaseline />
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </MuiThemeProvider>
  </>,
  document.getElementById('root'),
);
