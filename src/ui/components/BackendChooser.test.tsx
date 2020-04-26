import React from 'react';
import { render, wait, waitForElement, fireEvent } from '@testing-library/react';

import BackendChooser from './BackendChooser';
import Providers from './Providers';

const backends = [
  {
    slug: 'dss',
    config: { name: 'Advanced signature', version: '', exec: '', build: '' },
    available: 'Not really',
  },
  {
    slug: 'image',
    config: { name: 'Image signature', version: '', exec: '', build: '' },
    available: true as true,
  },
  {
    slug: 'third',
    config: { name: 'Third backend', version: '', exec: '', build: '' },
    available: true as true,
  },
];

describe('BackendChooser', () => {
  it('Does not render on show false', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={false} backends={backends} setChosenBackend={() => 0} />
      </Providers>,
    );

    await wait(() => expect(() => getByText('Image signature')).toThrow());
  });

  it('Displays list of backends', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} backends={backends} setChosenBackend={() => 0} />
      </Providers>,
    );

    await waitForElement(() => getByText('Advanced signature'));
    await waitForElement(() => getByText('Image signature'));
    await waitForElement(() => getByText('Third backend'));
  });

  it('Allows changing to different backend that is not disabled', async () => {
    const setChosenBackend = jest.fn();

    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} backends={backends} setChosenBackend={setChosenBackend} />
      </Providers>,
    );

    const dss = await waitForElement(() => getByText('Advanced signature'));
    const image = await waitForElement(() => getByText('Image signature'));
    const third = await waitForElement(() => getByText('Third backend'));

    fireEvent.click(dss);
    fireEvent.click(third);

    await wait(() => expect(setChosenBackend).toHaveBeenCalledWith('third'));

    fireEvent.click(dss);
    fireEvent.click(image);

    await wait(() => expect(setChosenBackend).toHaveBeenCalledWith('image'));

    expect(setChosenBackend).toHaveBeenCalledTimes(2);
  });

  it.todo('Shows tooltip for unavailable backend');
});
