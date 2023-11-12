import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import MainScreen from './MainScreen';
import mockWindowAPI from '../mockWindowAPI';
import Providers from './Providers';

describe('MainScreen', () => {
  beforeAll(() => {
    mockWindowAPI(window);

    window.OctoSign.list = vi.fn(() =>
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
    );
    window.OctoSign.set = vi.fn(() => Promise.resolve());
  });

  afterAll(() => {
    // @ts-expect-error This property has to be defined in reality
    window.OctoSign = undefined;
  });

  it('Gets list of backends and sets first available one', async () => {
    render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    await waitFor(() => expect(window.OctoSign.list).toHaveBeenCalled());
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));
  });

  it('Allows changing to different backend that is not disabled', async () => {
    const { container, getAllByText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    const file = new File([''], 'filename.pdf');

    const formElement = container.querySelector('input[type="file"]');
    Object.defineProperty(formElement, 'files', { value: [file] });

    act(() => {
      fireEvent.drop(formElement as Element);
    });

    const dss = await waitFor(() => getAllByText('Advanced signature')[0]);
    const image = await waitFor(() => getAllByText('Image signature')[0]);
    const third = await waitFor(() => getAllByText('Third backend')[0]);

    fireEvent.click(dss);
    fireEvent.click(third);

    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('third'));

    fireEvent.click(dss);
    fireEvent.click(image);

    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    expect(window.OctoSign.set).toHaveBeenCalledTimes(3);
  });

  it('Recognizes dragging of file', async () => {
    const { getByText, container } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    // We don't care about it in this test, but it wraps the state update with act
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    act(() => {
      fireEvent.dragEnter(container.firstChild?.firstChild as Element);
    });

    await waitFor(() => getByText('Drop your files here'));
  });

  it('Opens selection on click', async () => {
    const { getByText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    // We don't care about it in this test, but it wraps the state update with act
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    fireEvent.click(getByText('Select your file'));

    // TODO: Check if it calls open on the dropzone / change on the file input
  });

  it('Displays dropped file', async () => {
    const { getByText, container } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    // We don't care about it in this test, but it wraps the state update with act
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    const file = new File([''], 'filename.pdf');

    const formElement = container.querySelector('input[type="file"]');
    Object.defineProperty(formElement, 'files', { value: [file] });

    act(() => {
      fireEvent.drop(formElement as Element);
    });

    await waitFor(() => getByText('filename'));
  });

  it('Displays Settings if opened via Footer', async () => {
    const { baseElement, getByText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    // We don't care about it in this test, but it wraps the state update with act
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    // TODO: Change to something less tied to the mui classes
    const dialogContainer = baseElement.querySelector('.MuiDialog-root') as HTMLDivElement;

    expect(dialogContainer.style.visibility).toBe('hidden');

    const settingsLink = baseElement.querySelector('a[href="#settings"]') as HTMLAnchorElement;

    fireEvent.click(settingsLink);

    expect(dialogContainer.style.visibility).not.toBe('hidden');

    const closeButton = getByText('Close');

    fireEvent.click(closeButton);

    await waitFor(() => expect(dialogContainer.style.visibility).toBe('hidden'));
  });

  it('Has footer (with Logo)', async () => {
    const { getByAltText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    // We don't care about it in this test, but it wraps the state update with act
    await waitFor(() => expect(window.OctoSign.set).toHaveBeenCalledWith('image'));

    await waitFor(() => getByAltText('Logo'));
  });
});
