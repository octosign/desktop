/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import FileCardDetailsDialog from './FileCardDetailsDialog';
import Providers from './Providers';

describe('FileCardDetailsDialog', () => {
  it('Displays markdown details', () => {
    const markdown = `### Title\n\nAnd some more text!`;

    const { getByText } = render(
      <Providers>
        <FileCardDetailsDialog open onClose={() => 0} details={markdown} />
      </Providers>,
    );

    expect(() => getByText('Signature details')).not.toThrow();
    expect(() => getByText('Title')).not.toThrow();
    expect(() => getByText('And some more text!')).not.toThrow();
  });

  it('Is not displayed if not set to open', () => {
    const { getByText, rerender } = render(
      <Providers>
        <FileCardDetailsDialog open={false} onClose={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Signature details')).toThrow();

    rerender(
      <Providers>
        <FileCardDetailsDialog open onClose={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Signature details')).not.toThrow();
  });

  it('Calls onClose if closed', () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <Providers>
        <FileCardDetailsDialog open onClose={onClose} />
      </Providers>,
    );

    fireEvent.click(getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });
});
