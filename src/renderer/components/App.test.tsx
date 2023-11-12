import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

describe('App', () => {
  it('Renders MainScreen', async () => {
    vi.mock('./MainScreen', () => ({ default: () => 'Main' }));
    const App = (await import('./App')).default;

    const { getByText } = render(<App />);

    expect(() => getByText('Main')).not.toThrow();
  });
});
