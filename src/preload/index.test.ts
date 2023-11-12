import { join } from 'path';
import { vi } from 'vitest';

const currentWindow = {
  show: vi.fn(),
};
const loadBackends = vi.fn(() => Promise.resolve());
const listMock = vi.fn();
const metaMock = vi.fn();
const signMock = vi.fn();
const verifyMock = vi.fn();
const listMetadataMock = vi.fn(() => ({
  signer: {
    status: 'OK',
    options: [
      {
        id: 'test',
        label: 'Test',
        defaultValue: 'test',
      },
    ],
  },
}));
const managerMock = vi.fn(() => ({
  load: loadBackends,
  list: listMock,
  get: () => ({ meta: metaMock, sign: signMock, verify: verifyMock }),
  listMetadata: listMetadataMock,
}));
const setSettingsMock = vi.fn();
const settingsMock = vi.fn((options: object) => ({
  getOptions: () => options,
  get: () => ({
    signer: {
      test: 'test',
    },
  }),
  set: setSettingsMock,
}));
const writeFile = vi.fn();
const readFile = vi.fn();
const stat = vi.fn();
const isDevMock = vi.fn(() => true);
describe('Preload', () => {
  beforeEach(() => {
    // @ts-expect-error Simplified mock
    global.window = {};

    vi.resetModules();
  });

  beforeAll(() => {
    vi.mock('electron', () => ({
      remote: {
        getCurrentWindow: () => currentWindow,
        app: { getAppPath: () => '/root/', getVersion: () => '0.9001.0' },
      },
    }));

    vi.mock('./preload/BackendManager', () => managerMock);

    vi.mock('node:fs/promises', () => ({ writeFile, readFile, stat }));
    vi.mock('tmp-promise', () => ({ file: () => ({ path: '/tmp/123' }) }));

    vi.mock('electron-is-dev', isDevMock);

    vi.mock('./preload/Settings', () => settingsMock);
  });

  afterAll(() => {
    // @ts-expect-error Simplified mock
    delete global.window;

    vi.resetModules();

    vi.unmock('electron');
    vi.unmock('node:fs/promises');
    vi.unmock('tmp-promise');
    vi.unmock('./preload/BackendManager');
    vi.unmock('./preload/Settings');
  });

  it('Loads backend manager with correct path depending on the ENV', () => {
    require('./preload');

    expect(managerMock).toHaveBeenCalledWith(join('/backends/dist'));

    vi.resetModules();

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

  it('Allows calling sign on backend', async () => {
    require('./preload');
    await window.apiReady;
    await window.OctoSign.set('image');

    const onError = vi.fn();
    const onPrompt = vi.fn();

    await window.OctoSign.sign('file/path.pdf', onError, onPrompt);

    expect(signMock).toHaveBeenCalledWith('file/path.pdf', onError, onPrompt, expect.any(Function));
  });

  it('Allows calling verify on backend', async () => {
    require('./preload');
    await window.apiReady;
    await window.OctoSign.set('image');

    const onError = vi.fn();
    const onPrompt = vi.fn();

    await window.OctoSign.verify('file/path.pdf', onError, onPrompt);

    expect(verifyMock).toHaveBeenCalledWith(
      'file/path.pdf',
      onError,
      onPrompt,
      expect.any(Function),
    );
  });

  it('Returns undefined if no backend is set on sign, verify', async () => {
    require('./preload');
    await window.apiReady;

    const onError = vi.fn();
    const onPrompt = vi.fn();

    let result = await window.OctoSign.sign('file/path.pdf', onError, onPrompt);
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

  it('Allows creating file from path', async () => {
    globalThis.Blob = vi.fn();
    globalThis.ReadableStream = vi.fn();
    require('./preload');

    stat.mockReturnValueOnce(
      Promise.resolve({
        size: 456156,
        mtime: new Date(1578103935000),
      }),
    );
    readFile.mockReturnValueOnce('buffer');
    const result = await window.pathToFile('/smt.pdf');

    expect(result).toEqual(
      expect.objectContaining({
        path: '/smt.pdf',
        name: 'smt.pdf',
        lastModified: 1578103935000,
        size: 456156,
        type: 'application/pdf',
      }),
    );

    await expect(result.arrayBuffer()).resolves.toBe('buffer');
    expect(result.slice()).toBeInstanceOf(globalThis.Blob);
    expect(result.stream()).toBeInstanceOf(globalThis.ReadableStream);
    await expect(result.text()).resolves.toBe('');

    // @ts-expect-error Simplified mock
    delete globalThis.Blob;
    // @ts-expect-error Simplified mock
    delete globalThis.ReadableStream;
  });

  it('Defines require for spectron if env is right', () => {
    vi.resetModules();

    // @ts-expect-error Simplified mock
    expect(window.spectronRequire).toBeUndefined();

    process.env.SPECTRON = '1';

    require('./preload');

    // @ts-expect-error Simplified mock
    expect(window.spectronRequire).toBeDefined();

    process.env.SPECTRON = '0';
  });

  it('Gets app version', () => {
    require('./preload');
    const version = window.getVersion();

    // It's over 9000!!!
    expect(version).toBe('0.9001.0');
  });

  it('Allows getting options', async () => {
    require('./preload');
    await window.apiReady;

    const result = await window.OctoSign.getOptionValues();

    expect(result).toStrictEqual({
      signer: {
        test: 'test',
      },
    });
  });

  it('Allows settings options', async () => {
    require('./preload');
    await window.apiReady;

    window.OctoSign.setOptionValues({ signer: { test: 'test' } });

    expect(setSettingsMock).toHaveBeenCalledWith({
      signer: {
        test: 'test',
      },
    });
  });

  it.todo('Handles using of getoption in the backend');
});
