import React from 'react';
import { render } from '@testing-library/react';
import { useTheme } from '@material-ui/core';
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
      enqueueSnackbar('Hello there from snackbar');

      return <span>I will display snackbar</span>;
    };

    const { getByText } = render(
      <Providers>
        <Component />
      </Providers>,
    );

    expect(() => getByText('Hello there from snackbar')).not.toThrow();
  });
});
