import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './components/App';
import mockWindowAPI from './mockWindowAPI';
import Providers from './components/Providers';
import '../shared/i18nSetup';

// Mock window APIs if they were not loaded from electron - during UI development/UI tests
if (process.env.NODE_ENV === 'development' && window.OctoSign === undefined) {
  mockWindowAPI(window);
}

ReactDOM.render(
  <>
    <CssBaseline />
    <Providers>
      <App />
    </Providers>
  </>,
  document.getElementById('root'),
  () => window.showWindow(),
);
