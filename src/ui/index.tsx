import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { ThemeProvider } from 'styled-components';

import theme from './theme';
import App from './components/App';
import mockWindowAPI from './mockWindowAPI';

// Mock window APIs if they were not loaded from electron - during UI development/UI tests
if (process.env.NODE_ENV === 'development' && window.OctoSign === undefined) {
  mockWindowAPI(window);
}

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
  () => window.showWindow(),
);
