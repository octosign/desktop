import React from 'react';
import { render } from '@testing-library/react';

describe('App', () => {
  beforeAll(() => {
    jest.mock('./IntroPage', () => () => 'Intro');
  });

  afterAll(() => {
    jest.unmock('./IntroPage');
  });

  it('Renders IntroPage', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const App = require('./App').default;

      const { getByText } = render(<App />);

      expect(() => getByText('Intro')).not.toThrow();
    });
  });
});
