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
        defaultValue: '',
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
        defaultValue: '',
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

  it('Handles single prompt', () => {
    const request = {
      request: {
        promptType: 'single' as 'single',
        question: 'WUT',
        defaultValue: '1',
        options: [
          { key: '1', value: 'First option' },
          { key: '2', value: 'Second option' },
        ],
      },
      onResponse: jest.fn(),
    };

    const { getByText } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    getByText('First option') as HTMLElement;
    const secondOption = getByText('Second option') as HTMLElement;

    fireEvent.click(secondOption);

    expect(request.onResponse).toHaveBeenCalledWith('2');
  });

  it('Handles boolean prompt', () => {
    const request = {
      request: {
        promptType: 'boolean' as 'boolean',
        question: 'WUT',
        defaultValue: '',
      },
      onResponse: jest.fn(),
    };

    const { getByText, rerender } = render(
      <Providers>
        <Prompt request={request} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    getByText('Yes') as HTMLElement;
    const no = getByText('No') as HTMLElement;

    fireEvent.click(no);

    expect(request.onResponse).toHaveBeenCalledWith('0');

    rerender(
      <Providers>
        <Prompt request={{ ...request }} file={new File([], 'file.pdf')} />
      </Providers>,
    );

    const yes = getByText('Yes') as HTMLElement;

    fireEvent.click(yes);

    expect(request.onResponse).toHaveBeenCalledWith('1');
  });

  it.todo('Handles position prompt');

  it.todo('Handles image prompt');

  it.todo('Handles closing dialog as cancel');

  it.todo('Handles opening/closing based on the request prop');
});
