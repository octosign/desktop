import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import FilesArea from './FilesArea';
import Providers from './Providers';

describe('FilesArea', () => {
  it('Handles drag active', async () => {
    const { getByText, rerender } = render(
      <Providers>
        <FilesArea
          files={[]}
          isDragActive={false}
          openPicker={() => 0}
          supports={[]}
          onFileChanged={() => 0}
        />
      </Providers>,
    );

    expect(() => getByText('Sign a new document')).not.toThrow();
    expect(() => getByText('Drop your files here')).toThrow();

    rerender(
      <Providers>
        <FilesArea
          files={[]}
          isDragActive={true}
          openPicker={() => 0}
          supports={[]}
          onFileChanged={() => 0}
        />
      </Providers>,
    );

    expect(() => getByText('Sign a new document')).toThrow();
    expect(() => getByText('Drop your files here')).not.toThrow();
  });

  it('Handles opening of picker if no files are picked', () => {
    const openPicker = jest.fn();

    const { container, rerender } = render(
      <Providers>
        <FilesArea
          files={[]}
          isDragActive={false}
          openPicker={openPicker}
          supports={[]}
          onFileChanged={() => 0}
        />
      </Providers>,
    );

    fireEvent.click(container.firstChild as HTMLDivElement);

    expect(openPicker).toHaveBeenCalledTimes(1);

    rerender(
      <Providers>
        <FilesArea
          files={[new File([], 'smt.pdf')]}
          isDragActive={false}
          openPicker={openPicker}
          supports={[]}
          onFileChanged={() => 0}
        />
      </Providers>,
    );

    fireEvent.click(container.firstChild as HTMLDivElement);

    expect(openPicker).toHaveBeenCalledTimes(1);
  });

  it('Shows files', () => {
    const { findByText } = render(
      <Providers>
        <FilesArea
          files={[new File([], 'smt.pdf')]}
          isDragActive={false}
          openPicker={() => 0}
          supports={[]}
          onFileChanged={() => 0}
        />
      </Providers>,
    );

    expect(() => findByText('smt.pdf')).not.toThrow();
  });
});
