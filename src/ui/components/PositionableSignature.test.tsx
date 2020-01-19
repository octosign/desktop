/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, wait } from '@testing-library/react';
import interact from 'interactjs';

import Providers from './Providers';
import PositionableSignature from './PositionableSignature';

describe('PositionableSignature', () => {
  it('Handles moving of signature', async () => {
    const onChange = jest.fn();
    const { baseElement } = render(
      <Providers>
        <PositionableSignature onChange={onChange} path="path/signature.png" />
      </Providers>,
    );

    const signature = baseElement.querySelector('#signature') as HTMLDivElement;

    await wait(() => expect(interact('#signature').draggable().enabled).toBe(true));

    interact('#signature').fire({
      type: 'dragstart',
      target: signature,
      pageX: 10,
      pageY: 15,
    });
    interact('#signature').fire({
      type: 'dragmove',
      target: signature,
      pageX: 11,
      pageY: 17,
      dx: 1,
      dy: 2,
    });
    interact('#signature').fire({
      type: 'dragend',
      target: signature,
      pageX: 11,
      pageY: 17,
    });

    await wait(() => expect(onChange).toHaveBeenCalledWith({ x: 3, y: 4 }, 116));
  });

  it('Handles resizing of signature', async () => {
    const onChange = jest.fn();
    const { baseElement } = render(
      <Providers>
        <PositionableSignature onChange={onChange} path="path/signature.png" />
      </Providers>,
    );

    const signature = baseElement.querySelector('#signature') as HTMLDivElement;

    await wait(() => expect(interact('#signature').resizable().enabled).toBe(true));

    interact('#signature').fire({
      type: 'resizestart',
      target: signature,
      pageX: 10,
      pageY: 15,
    });
    interact('#signature').fire({
      type: 'resizemove',
      target: signature,
      pageX: 11,
      pageY: 17,
      rect: {
        width: 130,
      },
      deltaRect: {
        left: 4,
        top: 0,
      },
    });
    interact('#signature').fire({
      type: 'resizeend',
      target: signature,
      pageX: 11,
      pageY: 17,
    });

    await wait(() => expect(onChange).toHaveBeenCalledWith({ x: 6, y: 2 }, 126));
  });
});
