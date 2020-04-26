import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import Providers from './Providers';

describe('Providers', () => {
  it('Allow using theme', () => {
    const Component = () => {
      const theme = useTheme();

      return <span>{theme.palette.common.black}</span>;
    };

    const { getByText } = render(
      <Providers>
        <Component />
      </Providers>,
    );

    expect(() => getByText('#000')).not.toThrow();
  });

  it('Allow using snackbar', () => {
    const Component = () => {
      const { enqueueSnackbar } = useSnackbar();

      return (
        <>
          <button onClick={() => enqueueSnackbar('Hello there from snackbar')}>
            Get me snackbar
          </button>
          <span>I will display snackbar</span>
        </>
      );
    };

    const { getByText } = render(
      <Providers>
        <Component />
      </Providers>,
    );

    fireEvent.click(getByText('Get me snackbar'));

    expect(() => getByText('Hello there from snackbar')).not.toThrow();
  });
});
