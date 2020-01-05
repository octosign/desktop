const mockWindowAPI = (window: Window) => {
  window.OctoSign = {
    sign: () => undefined,
  };

  window.apiReady = Promise.resolve();
  window.showWindow = () => undefined;
};

export default mockWindowAPI;
