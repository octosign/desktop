/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import {
  render,
  fireEvent,
  waitForElement,
  act,
  wait,
  waitForElementToBeRemoved,
} from '@testing-library/react';

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
    jest.useFakeTimers();
    const verifyMock = jest.fn(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 'UNSIGNED' }))),
    );
    // @ts-ignore
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
    jest.useFakeTimers();
    const signMock = jest.fn(() => new Promise(resolve => setTimeout(resolve)));
    const verifyMock = jest.fn(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 'UNSIGNED' }))),
    );
    // @ts-ignore
    window.OctoSign = { sign: signMock, verify: verifyMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} supported={true} chosenBackend="dss" onFileChanged={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Verifying...')).not.toThrow();

    act(() => {
      jest.runAllTimers();
    });

    await wait(() => expect(() => getByText('Unsigned')).not.toThrow());

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

    act(() => {
      jest.runAllTimers();
    });

    waitForElement(() => getByText('Signed'));

    jest.useRealTimers();

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
    jest.useFakeTimers();
    const signMock = jest.fn<Promise<void>, Parameters<typeof window.OctoSign.sign>>(
      () => new Promise(resolve => setTimeout(resolve)),
    );
    // @ts-ignore
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
      jest.runAllTimers();
    });

    jest.useRealTimers();

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

    const verifyMock = jest.fn(() =>
      Promise.resolve({ status: 'SIGNED', details: 'Way too much detail' }),
    );
    // @ts-ignore
    window.OctoSign = { verify: verifyMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} supported={true} onFileChanged={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Signature details')).toThrow();
    expect(() => getByText('Way too much detail')).toThrow();

    await waitForElement(() => getByText('Open signature details'));

    fireEvent.click(getByText('Open signature details'));

    expect(() => getByText('Signature details')).not.toThrow();
    expect(() => getByText('Way too much detail')).not.toThrow();

    fireEvent.click(getByText('Close'));

    await waitForElementToBeRemoved(() => getByText('Signature details'));

    delete window.OctoSign;
  });

  it.todo('Adds button tooltip and disabling when in signing or verifying');

  it.todo('Handles prompts');
});
