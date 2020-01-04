const mockWindowAPI = (window: Window) => {
  window.OctoSign = {
    sign: () => undefined,
  };

  window.showWindow = () => undefined;
};

export default mockWindowAPI;
