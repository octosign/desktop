/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, wait, waitForElement, fireEvent, act } from '@testing-library/react';

import Providers from './Providers';
import PositionPromptType from './PositionPrompt';

const pdfPageRenderMock = jest.fn(() => ({ promise: Promise.resolve() }));
const pdfGetPageMock = jest.fn(() => ({
  getViewport: () => ({ width: 200, height: 400 }),
  render: pdfPageRenderMock,
}));
const pdfDocumentMock = jest.fn(() => ({
  numPages: 9,
  // @ts-ignore
  getPage: (pageNumber: number) => Promise.resolve(pdfGetPageMock(pageNumber)),
}));
const getDocumentMock = jest.fn(() => ({ promise: Promise.resolve(pdfDocumentMock()) }));
const PositionableSignatureMock = jest.fn(() => null);

let PositionPrompt: typeof PositionPromptType;
describe('PositionPrompt', () => {
  beforeAll(() => {
    jest.mock('pdfjs-dist', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjs = jest.genMockFromModule('pdfjs-dist') as any;
      pdfjs.getDocument = getDocumentMock;

      return pdfjs;
    });
    jest.mock('./PositionableSignature', () => PositionableSignatureMock);

    PositionPrompt = require('./PositionPrompt').default;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Renders passed PDF file on canvas', async () => {
    const onChange = jest.fn();
    const file = new File([''], 'filename.pdf');
    render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    await wait(() => expect(pdfGetPageMock).toHaveBeenCalledWith(1));
    await wait(() =>
      expect(pdfPageRenderMock).toHaveBeenCalledWith(
        expect.objectContaining({ viewport: { width: 200, height: 400 } }),
      ),
    );
  });

  it('Handles changing of page in both directions', async () => {
    const onChange = jest.fn();
    const file = new File([''], 'filename.pdf');
    const { getByText, getByLabelText } = render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    await waitForElement(() => getByText('1/9'));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,1');

    fireEvent.click(getByLabelText('Next page'));

    await waitForElement(() => getByText('2/9'));
    await wait(() => expect(pdfGetPageMock).toHaveBeenLastCalledWith(2));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,2');

    fireEvent.click(getByLabelText('Previous page'));

    await waitForElement(() => getByText('1/9'));
    await wait(() => expect(pdfGetPageMock).toHaveBeenLastCalledWith(1));
    expect(onChange).toHaveBeenLastCalledWith('0,0,0,1');
  });

  it('Handles changing of position', () => {
    const onChange = jest.fn();
    const file = new File([''], 'filename.pdf');
    render(
      <Providers>
        <PositionPrompt onChange={onChange} file={file} signature="path/signature.png" />
      </Providers>,
    );

    // @ts-ignore
    const onPositionChangeCallback = PositionableSignatureMock.mock.calls[0][0].onChange;

    act(() => {
      onPositionChangeCallback({ x: 10, y: 20 }, 150);
    });

    expect(onChange).toHaveBeenCalledWith('10,20,150,1');
  });
});
