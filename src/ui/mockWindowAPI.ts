const mockWindowAPI = (window: Window) => {
  window.OctoSign = {
    list: () => Promise.resolve([]),
    set: () => Promise.resolve(),
    meta: () => Promise.resolve(),
    sign: () => Promise.resolve(),
    verify: () => Promise.resolve(),
  };

  window.apiReady = Promise.resolve();
  window.showWindow = () => undefined;
};

export default mockWindowAPI;
