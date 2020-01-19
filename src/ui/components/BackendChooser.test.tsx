/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, wait, waitForElement, fireEvent } from '@testing-library/react';

import BackendChooser from './BackendChooser';
import Providers from './Providers';

describe('BackendChooser', () => {
  beforeAll(() => {
    // @ts-ignore
    window.OctoSign = {
      list: jest.fn(() =>
        Promise.resolve([
          {
            slug: 'dss',
            config: { name: 'Advanced signature' },
            available: 'Not really',
          },
          {
            slug: 'image',
            config: { name: 'Image signature' },
            available: true,
          },
          {
            slug: 'third',
            config: { name: 'Third backend' },
            available: true,
          },
        ]),
      ),
      set: jest.fn(() => Promise.resolve()),
    };
  });

  it('Gets list of backends and sets first available one but does not render on show false', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={false} />
      </Providers>,
    );

    await wait(() => expect(window.OctoSign.list).toHaveBeenCalled());
    await wait(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));
    await wait(() => expect(() => getByText('Image signature')).toThrow());
  });

  it('Displays list of backends', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} />
      </Providers>,
    );

    await waitForElement(() => getByText('Advanced signature'));
    await waitForElement(() => getByText('Image signature'));
  });

  it('Allows changing to different backend that is not disabled', async () => {
    const { getByText } = render(
      <Providers>
        <BackendChooser show={true} />
      </Providers>,
    );

    const dss = await waitForElement(() => getByText('Advanced signature'));
    const image = await waitForElement(() => getByText('Image signature'));
    const third = await waitForElement(() => getByText('Third backend'));

    fireEvent.click(dss);
    fireEvent.click(third);

    await wait(() => expect(window.OctoSign.set).toHaveBeenCalledWith('third'));

    fireEvent.click(dss);
    fireEvent.click(image);

    await wait(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    expect(window.OctoSign.set).toHaveBeenCalledTimes(3);
  });
});
