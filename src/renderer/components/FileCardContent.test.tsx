import React from 'react';
import { render } from '@testing-library/react';

import FileCardContent from './FileCardContent';
import Providers from './Providers';

describe('FileCardContent', () => {
  it('Displays file name, type, last modified date', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1578103935000 + new Date(1578103935000).getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'application/pdf',
    } as File;

    const { getByText } = render(
      <Providers>
        <FileCardContent file={file} status="UNKNOWN" />
      </Providers>,
    );

    expect(() => getByText('testFile')).not.toThrow();
    expect(() => getByText('.PDF')).not.toThrow();
    expect(() => getByText('Last modified: 01/04/2020, 2:12 AM')).not.toThrow();
  });

  it('Displays human readable file size', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    } as File;

    const { getByText, rerender } = render(
      <Providers>
        <FileCardContent file={file} status="UNKNOWN" />
      </Providers>,
    );

    expect(() => getByText('Size: 456.13 KB')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={{ ...file, size: 0 }} status="UNKNOWN" />
      </Providers>,
    );

    expect(() => getByText('Size: 0 B')).not.toThrow();
  });

  it('Supports files of unknown type', () => {
    const file = {
      name: 'testFile.tss',
      path: 'testFile.tss',
      lastModified: 1578103935000 + new Date(1578103935000).getTimezoneOffset() * 60 * 1000,
      size: 456132,
      type: 'unknown/tss',
      slice: () => new Blob(),
    } as File;

    const { getByText } = render(
      <Providers>
        <FileCardContent file={file} status="UNKNOWN" />
      </Providers>,
    );

    expect(() => getByText('testFile.tss')).not.toThrow();
    expect(() => getByText('.TSS')).toThrow();
    expect(() => getByText('Last modified: 01/04/2020, 2:12 AM')).not.toThrow();
  });

  it('Displays all supported statuses', () => {
    const file = {
      name: 'testFile.pdf',
      path: 'testFile.pdf',
      lastModified: 1,
      size: 456132,
      type: 'application/pdf',
      slice: () => new Blob(),
    } as File;

    const { getByText, rerender } = render(
      <Providers>
        <FileCardContent file={file} status="UNKNOWN" />
      </Providers>,
    );

    expect(() => getByText('Unknown')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={file} status="INVALID" />
      </Providers>,
    );

    expect(() => getByText('Invalid')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={file} status="SIGNED" />
      </Providers>,
    );

    expect(() => getByText('Signed')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={file} status="SIGNING" />
      </Providers>,
    );

    expect(() => getByText('Signing...')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={file} status="UNSIGNED" />
      </Providers>,
    );

    expect(() => getByText('Unsigned')).not.toThrow();

    rerender(
      <Providers>
        <FileCardContent file={file} status="VERIFYING" />
      </Providers>,
    );

    expect(() => getByText('Verifying...')).not.toThrow();
  });
});
