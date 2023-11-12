// Uses any to make the typing easier
/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn = (...args: any[]) => unknown;
const debounce = <F extends Fn>(func: F, wait = 250): F => {
  let timeout: NodeJS.Timeout;

  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    timeout = globalThis.setTimeout(function () {
      func.apply(context, args);
    }, wait);
  } as any;
};

export default debounce;
