const makeCancelable = <T>(promise: Promise<T>) => {
  let cancelled = false;
  let finished = false;
  let cancel: () => void = () => {
    // This should never happen though in the current implementation
    throw Error('Can not cancel before promise is fired');
  };

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then(
        value => !cancelled && resolve(value),
        error => !cancelled && reject(error),
      )
      .finally(() => (finished = true));

    cancel = () => {
      if (!finished) {
        cancelled = true;
        reject({ cancelled: true });
      }
    };
  });

  return {
    promise: wrappedPromise,
    cancel,
  };
};

export default makeCancelable;
