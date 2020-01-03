import React from 'react';
import { render, fireEvent, act, waitForElement } from '@testing-library/react';
import { MuiThemeProvider } from '@material-ui/core';
import { ThemeProvider } from 'styled-components';

import IntroPage from './IntroPage';
import theme from '../theme';

describe('IntroPage', () => {
  it('Recognizes dragging of file', async () => {
    const { getByText, container } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <IntroPage />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    act(() => {
      fireEvent.dragEnter(container.firstChild?.firstChild as Element);
    });

    await waitForElement(() => getByText('Drop your files here'));
  });

  it('Opens selection on click', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <IntroPage />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    fireEvent.click(getByText('Sign a new document'));

    // TODO: Check if it calls open on the dropzone / change on the file input
  });

  it('Displays dropped file', async () => {
    const { getByText, container } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <IntroPage />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const file = new File([''], 'file.pdf');

    const formElement = container.querySelector('input[type="file"]');
    Object.defineProperty(formElement, 'files', { value: [file] });

    act(() => {
      fireEvent.drop(formElement as Element);
    });

    await waitForElement(() => getByText('file.pdf'));
  });

  it('Has footer (with Logo)', () => {
    const { getByAltText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <IntroPage />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(() => getByAltText('Logo')).not.toThrow();
  });
});
