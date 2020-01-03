/* eslint-disable @typescript-eslint/ban-ts-ignore */

describe('Preload', () => {
  beforeAll(() => {
    // @ts-ignore
    global.window = {};
  });

  afterAll(() => {
    // @ts-ignore
    delete global.window;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('API allows calling sign on backend', () => {
    const signMock = jest.fn();
    jest.mock('./main/Backend', () => () => ({ sign: signMock }));

    require('./preload');

    // @ts-ignore
    global.window.OctoSign.sign('file/path.pdf');

    expect(signMock).toHaveBeenCalledWith('file/path.pdf');
  });

  it('API allows showing current electron window', () => {
    const currentWindow = {
      show: jest.fn(),
    };
    jest.mock('electron', () => ({
      remote: { getCurrentWindow: () => currentWindow },
    }));

    require('./preload');

    // @ts-ignore
    global.window.showWindow();

    expect(currentWindow.show).toHaveBeenCalled();
  });
});
