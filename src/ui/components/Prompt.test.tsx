/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Providers from './Providers';
import Prompt from './Prompt';

describe('Prompt', () => {
  it('Handles cancelling', async () => {
    const request = {
      request: {
        promptType: 'text' as 'text',
        question: 'WUT',
      },
      onResponse: jest.fn(),
    };

    const { getByText } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    fireEvent.click(getByText('Cancel'));

    expect(request.onResponse).toHaveBeenCalledWith(undefined);
  });

  it('Handles unsupported prompt', () => {
    const request = {
      request: {
        promptType: 'madeup' as 'text',
        question: 'WUT',
      },
      onResponse: jest.fn(),
    };

    const { getByText } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    expect(() => getByText('not yet supported', { exact: false })).not.toThrow();
  });

  it('Handles text prompt', () => {
    const request = {
      request: {
        promptType: 'text' as 'text',
        question: 'WUT',
        defaultValue: 'default something',
      },
      onResponse: jest.fn(),
    };

    const { getByText, getByLabelText } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    const input = getByLabelText('Text') as HTMLInputElement;

    expect(input.value).toBe('default something');

    fireEvent.change(input, { target: { value: 'Made up response' } });

    fireEvent.click(getByText('Confirm'));

    expect(request.onResponse).toHaveBeenCalledWith('Made up response');
  });

  it('Handles password prompt', () => {
    const request = {
      request: {
        promptType: 'password' as 'password',
        question: 'WUT',
        defaultValue: 'default something',
      },
      onResponse: jest.fn(),
    };

    const { getByText, getByLabelText } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    const input = getByLabelText('Password') as HTMLInputElement;

    expect(input.value).toBe('default something');

    fireEvent.change(input, { target: { value: 'Made up response' } });

    fireEvent.click(getByText('Confirm'));

    expect(request.onResponse).toHaveBeenCalledWith('Made up response');
  });

  it.todo('Handles position prompt');

  it.todo('Handles image prompt');

  it.todo('Handles closing dialog as cancel');

  it.todo('Handles opening/closing based on the request prop');
});
