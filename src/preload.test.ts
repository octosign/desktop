import { join } from 'path';

/* eslint-disable @typescript-eslint/ban-ts-ignore */

const currentWindow = {
  show: jest.fn(),
};
const loadBackends = jest.fn(() => Promise.resolve());
const signMock = jest.fn();
const managerMock = jest.fn(() => ({
  load: loadBackends,
  get: () => ({ sign: signMock }),
}));
describe('Preload', () => {
  beforeAll(() => {
    // @ts-ignore
    global.window = {};
  });

  afterAll(() => {
    // @ts-ignore
    delete global.window;

    jest.unmock('electron');
  });

  beforeEach(() => {
    jest.resetModules();

    jest.mock('electron', () => ({
      remote: {
        getCurrentWindow: () => currentWindow,
        app: { getAppPath: () => '/root/' },
      },
    }));

    jest.mock('./main/BackendManager', () => () => ({
      load: loadBackends,
      get: () => ({ sign: signMock }),
    }));
  });

  it('Loads backend manager with correct path depending on the ENV', () => {
    jest.mock('./main/BackendManager', () => managerMock);
    jest.mock('electron', () => ({
      remote: { app: { getAppPath: () => '/root/' } },
    }));
    jest.mock('electron-is-dev', () => true);

    require('./preload');

    expect(managerMock).toHaveBeenCalledWith(join('/backends/dist'));

    jest.isolateModules(() => {
      jest.mock('./main/BackendManager', () => managerMock);
      jest.mock('electron', () => ({
        remote: { app: { getAppPath: () => '/root/' } },
      }));
      jest.mock('electron-is-dev', () => false);

      require('./preload');

      expect(managerMock).toHaveBeenCalledWith(join('/backends/dist'));
    });
  });

  it('API allows calling sign on backend', async () => {
    require('./preload');
    // @ts-ignore
    await global.window.apiReady;

    // @ts-ignore
    global.window.OctoSign.sign('file/path.pdf');

    expect(signMock).toHaveBeenCalledWith('file/path.pdf');
  });

  it('API allows showing current electron window', () => {
    require('./preload');

    // @ts-ignore
    global.window.showWindow();

    expect(currentWindow.show).toHaveBeenCalled();
  });

  it('Defines require for spectron if env is right', () => {
    // @ts-ignore
    expect(window.spectronRequire).toBeUndefined();

    process.env.SPECTRON = '1';

    require('./preload');

    // @ts-ignore
    expect(window.spectronRequire).toBeDefined();

    process.env.SPECTRON = '0';
  });
});
