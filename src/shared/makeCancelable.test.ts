import makeCancelable from './makeCancelable';

describe('Make cancelable', () => {
  it('Lets promise work as expected if not cancelled', async () => {
    const cancelable = makeCancelable(Promise.resolve('Lalala'));

    await expect(cancelable.promise).resolves.toEqual('Lalala');

    const cancelableRejected = makeCancelable(Promise.reject('Lololo'));

    await expect(cancelableRejected.promise).rejects.toEqual('Lololo');
  });

  it('Reject right after cancel and ignores promise result', async () => {
    const cancelable = makeCancelable(new Promise(resolve => setTimeout(() => resolve('Lalala'))));
    cancelable.cancel();
    await expect(cancelable.promise).rejects.toEqual({ cancelled: true });

    const cancelableRejected = makeCancelable(
      new Promise((_, reject) => setTimeout(() => reject('Lololo'))),
    );
    cancelableRejected.cancel();
    await expect(cancelableRejected.promise).rejects.toEqual({ cancelled: true });
  });

  it('Cancelling after it finished will not affect anything', async () => {
    const cancelable = makeCancelable(Promise.resolve('Lalala'));

    await expect(cancelable.promise).resolves.toEqual('Lalala');

    cancelable.cancel();
  });
});
