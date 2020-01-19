import { join } from 'path';

/* eslint-disable @typescript-eslint/ban-ts-ignore */

const currentWindow = {
  show: jest.fn(),
};
const loadBackends = jest.fn(() => Promise.resolve());
const listMock = jest.fn();
const metaMock = jest.fn();
const signMock = jest.fn();
const verifyMock = jest.fn();
const managerMock = jest.fn(() => ({
  load: loadBackends,
  list: listMock,
  get: () => ({ meta: metaMock, sign: signMock, verify: verifyMock }),
}));
const writeFile = jest.fn();
const isDevMock = jest.fn(() => true);
describe('Preload', () => {
  beforeEach(() => {
    // @ts-ignore
    global.window = {};

    jest.resetModules();
  });

  beforeAll(() => {
    jest.mock('electron', () => ({
      remote: {
        getCurrentWindow: () => currentWindow,
        app: { getAppPath: () => '/root/' },
      },
    }));

    jest.mock('./preload/BackendManager', () => managerMock);

    jest.mock('fs-extra', () => ({ writeFile }));
    jest.mock('tmp-promise', () => ({ file: () => ({ path: '/tmp/123' }) }));

    jest.mock('electron-is-dev', isDevMock);
  });

  afterAll(() => {
    // @ts-ignore
    delete global.window;

    jest.resetModules();

    jest.unmock('electron');
    jest.unmock('./preload/BackendManager');
    jest.unmock('fs-extra');
    jest.unmock('tmp-promise');
  });

  it('Loads backend manager with correct path depending on the ENV', () => {
    require('./preload');

    expect(managerMock).toHaveBeenCalledWith(join('/backends/dist'));

    jest.resetModules();

    isDevMock.mockReturnValueOnce(false);

    require('./preload');

    expect(managerMock).toHaveBeenCalledWith(join('/backends'));
  });

  it('Allows calling list', async () => {
    require('./preload');
    await window.apiReady;

    listMock.mockReturnValue([]);
    const result = await window.OctoSign.list();

    expect(listMock).toHaveBeenCalled();
    expect(result).toStrictEqual([]);
  });

  it('Allows calling meta on backend', async () => {
    require('./preload');
    await window.apiReady;
    await window.OctoSign.set('image');

    const onError = jest.fn();
    const onPrompt = jest.fn();

    await window.OctoSign.meta(onError, onPrompt);

    expect(metaMock).toHaveBeenCalledWith(onError, onPrompt);
  });

  it('Allows calling sign on backend', async () => {
    require('./preload');
    await window.apiReady;
    await window.OctoSign.set('image');

    const onError = jest.fn();
    const onPrompt = jest.fn();

    await window.OctoSign.sign('file/path.pdf', onError, onPrompt);

    expect(signMock).toHaveBeenCalledWith('file/path.pdf', onError, onPrompt);
  });

  it('Allows calling verify on backend', async () => {
    require('./preload');
    await window.apiReady;
    await window.OctoSign.set('image');

    const onError = jest.fn();
    const onPrompt = jest.fn();

    await window.OctoSign.verify('file/path.pdf', onError, onPrompt);

    expect(verifyMock).toHaveBeenCalledWith('file/path.pdf', onError, onPrompt);
  });

  it('Returns undefined if no backend is set on meta, sign, verify', async () => {
    require('./preload');
    await window.apiReady;

    const onError = jest.fn();
    const onPrompt = jest.fn();

    let result = await window.OctoSign.meta(onError, onPrompt);
    expect(metaMock).not.toHaveBeenCalled();
    expect(result).toBe(undefined);

    result = await window.OctoSign.sign('file/path.pdf', onError, onPrompt);
    expect(signMock).not.toHaveBeenCalled();
    expect(result).toBe(undefined);

    result = await window.OctoSign.verify('file/path.pdf', onError, onPrompt);
    expect(verifyMock).not.toHaveBeenCalled();
    expect(result).toBe(undefined);
  });

  it('Allows showing current electron window', () => {
    require('./preload');

    window.showWindow();

    expect(currentWindow.show).toHaveBeenCalled();
  });

  it('Allows creating tmp image', async () => {
    require('./preload');

    const result = await window.createTmpImage('data:image/jpeg;base64,456456123465');

    expect(writeFile).toHaveBeenCalledWith('/tmp/123', Buffer.from('456456123465', 'base64'));
    expect(result).toBe('/tmp/123');
  });

  it('Creating tmp image without correct mime type throws', async () => {
    require('./preload');

    await expect(window.createTmpImage('image/jpeg;base64,456456123465')).rejects.toEqual(
      new Error('Can not parse image format'),
    );
  });

  it('Defines require for spectron if env is right', () => {
    jest.resetModules();

    // @ts-ignore
    expect(window.spectronRequire).toBeUndefined();

    process.env.SPECTRON = '1';

    require('./preload');

    // @ts-ignore
    expect(window.spectronRequire).toBeDefined();

    process.env.SPECTRON = '0';
  });
});
