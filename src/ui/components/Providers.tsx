import React, { FC } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';

import theme from '../theme';
import '../../shared/i18nSetup';

const Providers: FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        preventDuplicate={true}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

export default Providers;
