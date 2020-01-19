/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, fireEvent, act, waitForElement } from '@testing-library/react';

import MainScreen from './MainScreen';
import mockWindowAPI from '../mockWindowAPI';
import Providers from './Providers';

describe('MainScreen', () => {
  beforeAll(() => {
    mockWindowAPI(window);
  });

  afterAll(() => {
    // @ts-ignore
    window.OctoSign = undefined;
  });

  it('Recognizes dragging of file', async () => {
    const { getByText, container } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    act(() => {
      fireEvent.dragEnter(container.firstChild?.firstChild as Element);
    });

    await waitForElement(() => getByText('Drop your files here'));
  });

  it.skip('Opens selection on click', () => {
    const { getByText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    fireEvent.click(getByText('Sign a new document'));

    // TODO: Check if it calls open on the dropzone / change on the file input
  });

  it('Displays dropped file', async () => {
    const { getByText, container } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    const file = new File([''], 'filename.pdf');

    const formElement = container.querySelector('input[type="file"]');
    Object.defineProperty(formElement, 'files', { value: [file] });

    act(() => {
      fireEvent.drop(formElement as Element);
    });

    await waitForElement(() => getByText('filename'));
  });

  it.todo('Displays choosing of backends if file is chosen');

  it('Has footer (with Logo)', async () => {
    const { getByAltText } = render(
      <Providers>
        <MainScreen />
      </Providers>,
    );

    await waitForElement(() => getByAltText('Logo'));
  });
});
