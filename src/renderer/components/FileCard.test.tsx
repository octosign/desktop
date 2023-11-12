import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  act,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { vi } from 'vitest';

import FileCard from './FileCard';
import Providers from './Providers';

describe('FileCard', () => {
  it('Triggers verification on mount', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'path/file.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    } as File;
    vi.useFakeTimers();
    const verifyMock = vi.fn(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 'UNSIGNED' }))),
    );
    // @ts-expect-error Simplified mock
    window.OctoSign = { verify: verifyMock };

    render(
      <Providers>
        <FileCard file={file} supported={true} chosenBackend="dss" onFileChanged={() => 0} />
      </Providers>,
    );

    expect(verifyMock).toHaveBeenCalledWith(
      'path/file.pdf',
      expect.any(Function),
      expect.any(Function),
    );

    // @ts-expect-error Simplified mock
    delete window.OctoSign;
  });

  it('Allows signing', async () => {
    const file = {
      name: 'testFile.pdf',
      path: 'path/file.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    } as File;
    vi.useFakeTimers();
    const signMock = vi.fn(() => new Promise(resolve => setTimeout(resolve)));
    const verifyMock = vi.fn(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 'UNSIGNED' }))),
    );
    // @ts-expect-error Simplified mock
    window.OctoSign = { sign: signMock, verify: verifyMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} supported={true} chosenBackend="dss" onFileChanged={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Verifying...')).not.toThrow();

    vi.runOnlyPendingTimers();
    vi.useRealTimers();

    await waitFor(() => expect(() => getByText('Unsigned')).not.toThrow());

    vi.useFakeTimers();

    fireEvent.click(getByText('Sign').closest('button') as HTMLElement);

    expect(signMock).toHaveBeenCalledWith(
      'path/file.pdf',
      expect.any(Function),
      expect.any(Function),
    );

    expect(() => getByText('Signing...')).not.toThrow();

    verifyMock.mockReturnValueOnce(
      new Promise(resolve => setTimeout(() => resolve({ status: 'SIGNED' }))),
    );

    vi.runOnlyPendingTimers();
    vi.useRealTimers();

    waitFor(() => getByText('Signed'));

    // @ts-expect-error Simplified mock
    delete window.OctoSign;
  });

  it('Displays errors during signing', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'path/file.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    } as File;
    vi.useFakeTimers();
    const signMock = vi.fn<Parameters<typeof window.OctoSign.sign>, Promise<void>>(
      () => new Promise(resolve => setTimeout(resolve)),
    );
    // @ts-expect-error Simplified mock
    window.OctoSign = { sign: signMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} supported={true} onFileChanged={() => 0} />
      </Providers>,
    );

    fireEvent.click(getByText('Sign').closest('button') as HTMLElement);

    const onErrorCallback = signMock.mock.calls[0][1];

    onErrorCallback('Something happended during signing');

    expect(() => getByText('Something happended during signing')).not.toThrow();

    act(() => {
      vi.runAllTimers();
    });

    vi.useRealTimers();

    // @ts-expect-error Simplified mock
    delete window.OctoSign;
  });

  it('Disables Sign button if file is unsupported', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1578103935000 + new Date(1578103935000).getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'application/pdf',
    } as File;

    const { getByText, rerender } = render(
      <Providers>
        <FileCard file={file} supported={true} onFileChanged={() => 0} />
      </Providers>,
    );

    let signButton = getByText('Sign').closest('button') as HTMLButtonElement;

    expect(signButton.disabled).toBeFalsy();

    rerender(
      <Providers>
        <FileCard file={file} supported={false} onFileChanged={() => 0} />
      </Providers>,
    );

    signButton = getByText('Sign').closest('button') as HTMLButtonElement;

    expect(signButton.disabled).toBeTruthy();
  });

  it('Opens details on button if available', async () => {
    const file = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1578103935000 + new Date(1578103935000).getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'application/pdf',
    } as File;

    const verifyMock = vi.fn(() =>
      Promise.resolve({ status: 'SIGNED', details: 'Way too much detail' }),
    );
    // @ts-expect-error Simplified mock
    window.OctoSign = { verify: verifyMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} supported={true} onFileChanged={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Signature details')).toThrow();
    expect(() => getByText('Way too much detail')).toThrow();

    await waitFor(() => getByText('Open signature details'));

    fireEvent.click(getByText('Open signature details'));

    expect(() => getByText('Signature details')).not.toThrow();
    expect(() => getByText('Way too much detail')).not.toThrow();

    fireEvent.click(getByText('Close'));

    await waitForElementToBeRemoved(() => getByText('Signature details'));

    // @ts-expect-error Simplified mock
    delete window.OctoSign;
  });

  it.todo('Adds button tooltip and disabling when in signing or verifying');

  it.todo('Handles prompts');
});
