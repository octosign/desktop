import React from 'react';
import { render, fireEvent, waitForElement, act } from '@testing-library/react';
import { MuiThemeProvider } from '@material-ui/core';
import { ThemeProvider } from 'styled-components';

import FileCard from './FileCard';
import theme from '../theme';

describe('FileCard', () => {
  it('Displays file name, type, last modified date', () => {
    const file: File = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1578103935000 + new Date().getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    };

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <FileCard file={file} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(() => getByText(file.name)).not.toThrow();
    expect(() => getByText(`Type: ${file.type}`)).not.toThrow();
    expect(() => getByText('Last modified: 01/04/2020, 2:12 AM')).not.toThrow();
  });

  it('Displays human readable file size', () => {
    const file: File = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    };

    const { getByText, rerender } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <FileCard file={file} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(() => getByText('Size: 456.13 KB')).not.toThrow();

    rerender(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <FileCard file={{ ...file, size: 0 }} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(() => getByText('Size: 0 B')).not.toThrow();
  });

  it('Allows signing', () => {
    const file: File = {
      name: 'testFile.pdf',
      path: 'path/file.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    };
    jest.useFakeTimers();
    const signMock = jest.fn(() => new Promise(resolve => setTimeout(resolve)));
    window.OctoSign = { sign: signMock };

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <FileCard file={file} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(() => getByText('Unsigned')).not.toThrow();

    fireEvent.click(getByText('Sign').closest('button') as HTMLElement);

    expect(signMock).toHaveBeenCalledWith('path/file.pdf');

    expect(() => getByText('Signing...')).not.toThrow();

    act(() => {
      jest.runAllTimers();
    });

    waitForElement(() => getByText('Unsigned'));

    jest.useRealTimers();

    delete window.OctoSign;
  });

  it.todo('Catches error during signing');
});
