import debounce from './debounce';
import { wait } from '@testing-library/react';

describe('Debounce', () => {
  it('Calls passed function only once if called twice within timeout', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 0);
    debounced();
    debounced();
    await wait(() => expect(fn).toHaveBeenCalledTimes(1));
  });

  it('Calls passed function with all original parameters', async () => {
    const fn = jest.fn((one: string, two: string) => one + two);
    const debounced = debounce(fn, 0);
    debounced('one', 'two');
    debounced('three', 'four');
    await wait(() => expect(fn).toHaveBeenCalledWith('three', 'four'));
  });

  it('Retains "this" context', async () => {
    let insideThis: unknown;
    const fn = jest.fn(function callback(this: {}) {
      insideThis = this;
    });
    const debounced = debounce(fn.bind({ is: 'sparta' }), 0);
    debounced();
    await wait(() => expect(insideThis).toStrictEqual({ is: 'sparta' }));
  });

  it('Default timeout is 250ms', async () => {
    const spy = jest.spyOn(globalThis, 'setTimeout');
    const fn = jest.fn();
    const debounced = debounce(fn);
    debounced('one', 'two');
    await wait(() => expect(spy).toHaveBeenCalledWith(expect.any(Function), 250));
    spy.mockRestore();
  });
});
