import debounce from './debounce';
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';

describe('Debounce', () => {
  it('Calls passed function only once if called twice within timeout', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 0);

    debounced();
    debounced();

    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1));
  });

  it('Calls passed function with all original parameters', async () => {
    const fn = vi.fn((one: string, two: string) => one + two);
    const debounced = debounce(fn, 0);

    debounced('one', 'two');
    debounced('three', 'four');

    await waitFor(() => expect(fn).toHaveBeenCalledWith('three', 'four'));
  });

  it('Retains "this" context', async () => {
    let insideThis: { is: string } | undefined;
    const fn = vi.fn(function callback(this: { is: string }) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      insideThis = this;
    });
    const debounced = debounce(fn.bind({ is: 'sparta' }), 0);

    debounced();

    await waitFor(() => expect(insideThis).toStrictEqual({ is: 'sparta' }));
  });

  it('Default timeout is 250ms', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const fn = vi.fn();
    const debounced = debounce(fn);

    debounced('one', 'two');

    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.any(Function), 250));
    spy.mockRestore();
  });
});
