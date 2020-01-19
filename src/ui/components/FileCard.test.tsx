/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, fireEvent, waitForElement, act } from '@testing-library/react';

import FileCard from './FileCard';
import Providers from './Providers';

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
      <Providers>
        <FileCard file={file} />
      </Providers>,
    );

    expect(() => getByText('testFile')).not.toThrow();
    expect(() => getByText('.PDF')).not.toThrow();
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
      <Providers>
        <FileCard file={file} />
      </Providers>,
    );

    expect(() => getByText('Size: 456.13 KB')).not.toThrow();

    rerender(
      <Providers>
        <FileCard file={{ ...file, size: 0 }} />
      </Providers>,
    );

    expect(() => getByText('Size: 0 B')).not.toThrow();
  });

  it('Supports files of unknown type', () => {
    const file: File = {
      name: 'testFile.tss',
      path: 'testFile.tss',
      lastModified: 1578103935000 + new Date().getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'unknown/tss',
      slice: () => new Blob(),
    };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} />
      </Providers>,
    );

    expect(() => getByText('testFile.tss')).not.toThrow();
    expect(() => getByText('.TSS')).toThrow();
    expect(() => getByText('Last modified: 01/04/2020, 2:12 AM')).not.toThrow();
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
    // @ts-ignore
    window.OctoSign = { sign: signMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} />
      </Providers>,
    );

    expect(() => getByText('Unsigned')).not.toThrow();

    fireEvent.click(getByText('Sign').closest('button') as HTMLElement);

    expect(signMock).toHaveBeenCalledWith(
      'path/file.pdf',
      expect.any(Function),
      expect.any(Function),
    );

    expect(() => getByText('Signing...')).not.toThrow();

    act(() => {
      jest.runAllTimers();
    });

    waitForElement(() => getByText('Unsigned'));

    jest.useRealTimers();

    delete window.OctoSign;
  });

  it('Displays errors during signing', () => {
    const file: File = {
      name: 'testFile.pdf',
      path: 'path/file.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    };
    jest.useFakeTimers();
    const signMock = jest.fn<Promise<void>, Parameters<typeof window.OctoSign.sign>>(
      () => new Promise(resolve => setTimeout(resolve)),
    );
    // @ts-ignore
    window.OctoSign = { sign: signMock };

    const { getByText } = render(
      <Providers>
        <FileCard file={file} />
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

  it.todo('Reverts status back if signing throws');

  it.todo('Handles prompts');
});
