/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import ImagePrompt from './ImagePrompt';
import Providers from './Providers';

describe('ImagePrompt', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Allows picking file', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <Providers>
        <ImagePrompt onChange={onChange} onCanvasData={() => 0} />
      </Providers>,
    );

    const file = new File([''], 'path/filename.pdf');
    file.path = 'path/filename.pdf';

    const formElement = container.querySelector('input[type="file"]');
    Object.defineProperty(formElement, 'files', { value: [file] });

    act(() => {
      fireEvent.change(formElement as Element);
    });

    expect(onChange).toHaveBeenCalledWith('path/filename.pdf', true);
  });

  it('Allows drawing signature on canvas', () => {
    const onCanvasData = jest.fn();
    const { container } = render(
      <Providers>
        <ImagePrompt onChange={() => 0} onCanvasData={onCanvasData} />
      </Providers>,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.mouseDown(canvas, { which: 1 });
    fireEvent.mouseUp(canvas, { which: 1 });

    expect(onCanvasData).toHaveBeenCalledWith('data:image/png;base64,00');
  });

  it('Allows clearing drawn signature', () => {
    const onCanvasData = jest.fn();
    const { getByText, container } = render(
      <Providers>
        <ImagePrompt onChange={() => 0} onCanvasData={onCanvasData} />
      </Providers>,
    );

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    expect(context?.clearRect).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Clear'));

    expect(context?.clearRect).toHaveBeenCalledTimes(2);
  });
});
