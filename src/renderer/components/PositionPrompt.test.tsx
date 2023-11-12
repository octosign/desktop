import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

import Providers from './Providers';

import { pdfGetPageMock, pdfPageRenderMock } from '../../../__mocks__/pdfjs-dist';

const PositionableSignatureMock = vi.fn(() => null);
vi.mock('./PositionableSignature', () => ({ default: PositionableSignatureMock}));

describe('PositionPrompt', () => {
  it('Renders passed PDF file on canvas', async () => {
    const PositionPrompt = (await import('./PositionPrompt')).default;

    const onChange = vi.fn();
    const file = new File([''], 'filename.pdf');
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));
    render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    await waitFor(() => expect(pdfGetPageMock).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(pdfPageRenderMock).toHaveBeenCalledWith(
        expect.objectContaining({ viewport: { width: 200, height: 400 } }),
      ),
    );
  });

  it('Handles changing of page in both directions', async () => {
    const PositionPrompt = (await import('./PositionPrompt')).default;

    const onChange = vi.fn();
    const file = new File([''], 'filename.pdf');
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));
    const { getByText, getByLabelText } = render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    await waitFor(() => getByText('1/9'));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,1');

    fireEvent.click(getByLabelText('Next page'));

    await waitFor(() => getByText('2/9'));
    await waitFor(() => expect(pdfGetPageMock).toHaveBeenLastCalledWith(2));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,2');

    fireEvent.click(getByLabelText('Previous page'));

    await waitFor(() => getByText('1/9'));
    await waitFor(() => expect(pdfGetPageMock).toHaveBeenLastCalledWith(1));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,1');
  });

  it('Handles changing of position', async () => {
    const PositionPrompt = (await import('./PositionPrompt')).default;

    const onChange = vi.fn();
    const file = new File([''], 'filename.pdf');
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));
    render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    // @ts-expect-error Simplified mock
    const onPositionChangeCallback = PositionableSignatureMock.mock.calls[0][0].onChange;

    act(() => {
      onPositionChangeCallback({ x: 10, y: 20 }, 150);
    });

    expect(onChange).toHaveBeenCalledWith('10,20,150,1');
  });
});
