import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import LabelButton from './LabelButton';
import Providers from './Providers';

describe('LabelButton', () => {
  it('Triggers click on labeled element', () => {
    const onClick = jest.fn();

    const { getByText } = render(
      <Providers>
        <>
          <button id="focusable" onClick={onClick} />
          <LabelButton htmlFor="focusable" label="Focusable input" />
        </>
      </Providers>,
    );

    const label = getByText('Focusable input');

    fireEvent.click(label.closest('label') as HTMLLabelElement);

    expect(onClick).toHaveBeenCalled();
  });

  it.todo('Adjusts border radius based on the group position');
});
