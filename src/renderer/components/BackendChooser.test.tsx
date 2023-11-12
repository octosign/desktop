import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import BackendChooser from './BackendChooser';
import Providers from './Providers';

const backends = [
  {
    slug: 'dss',
    config: { name: 'Advanced signature', version: '', exec: '', build: '' },
    available: 'Not really',
  } as const,
  {
    slug: 'image',
    config: { name: 'Image signature', version: '', exec: '', build: '' },
    available: true,
  } as const,
  {
    slug: 'third',
    config: { name: 'Third backend', version: '', exec: '', build: '' },
    available: true,
  } as const,
];

describe('BackendChooser', () => {
  it('Does not render on show false', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={false} backends={backends} setChosenBackend={() => 0} />
      </Providers>,
    );

    await waitFor(() => expect(() => getByText('Image signature')).toThrow());
  });

  it('Displays list of backends', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} backends={backends} setChosenBackend={() => 0} />
      </Providers>,
    );

    await waitFor(() => getByText('Advanced signature'));
    await waitFor(() => getByText('Image signature'));
    await waitFor(() => getByText('Third backend'));
  });

  it('Allows changing to different backend that is not disabled', async () => {
    const setChosenBackend = vi.fn();

    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} backends={backends} setChosenBackend={setChosenBackend} />
      </Providers>,
    );

    const dss = await waitFor(() => getByText('Advanced signature'));
    const image = await waitFor(() => getByText('Image signature'));
    const third = await waitFor(() => getByText('Third backend'));

    fireEvent.click(dss);
    fireEvent.click(third);

    await waitFor(() => expect(setChosenBackend).toHaveBeenCalledWith('third'));

    fireEvent.click(dss);
    fireEvent.click(image);

    await waitFor(() => expect(setChosenBackend).toHaveBeenCalledWith('image'));

    expect(setChosenBackend).toHaveBeenCalledTimes(2);
  });

  it.todo('Shows tooltip for unavailable backend');
});
