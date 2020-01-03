import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MuiThemeProvider } from '@material-ui/core';
import { ThemeProvider } from 'styled-components';

import Footer from './Footer';
import theme from '../theme';

describe('Footer', () => {
  it('Contains logo that opens octosign.com', () => {
    const { getByAltText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Footer onSelectFiles={() => 0} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const logo = getByAltText('Logo');
    const anchor = logo.closest('a') as HTMLAnchorElement;

    expect(anchor.href).toMatch(/octosign\.com/);
    expect(anchor.target).toBe('blank');
  });

  it('Contains "Select files" button triggering selection and info about drag & drop', () => {
    const onSelectFilesMock = jest.fn();

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Footer onSelectFiles={onSelectFilesMock} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    fireEvent.click(getByText('Select files'));

    expect(onSelectFilesMock).toHaveBeenCalled();

    expect(() => getByText('drag and drop', { exact: false })).not.toThrow();
  });

  it('Contains link to Help that opens octosign.com/help', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Footer onSelectFiles={() => 0} />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const anchor = getByText('Help') as HTMLAnchorElement;

    expect(anchor.href).toMatch(/octosign\.com\/help/);
    expect(anchor.target).toBe('blank');
  });

  it.todo('Contains link to Settings that opens Settings page');
});
