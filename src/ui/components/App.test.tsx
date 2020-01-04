import React from 'react';
import { render } from '@testing-library/react';

describe('App', () => {
  beforeAll(() => {
    jest.mock('./MainScreen', () => () => 'Main');
  });

  afterAll(() => {
    jest.unmock('./MainScreen');
  });

  it('Renders MainScreen', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const App = require('./App').default;

      const { getByText } = render(<App />);

      expect(() => getByText('Main')).not.toThrow();
    });
  });
});
