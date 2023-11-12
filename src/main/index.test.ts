import { vi } from 'vitest';

import { appOn, browserWindow, loadFile, mainWindowOn, openDevTools, quit, removeMenu, shell, whenReady } from '../../__mocks__/electron';

// TODO: This needs rewrite - small parts should be extracted and unit tested, rest not at all
describe.skip('Main', () => {
  it('Registers callbacks on the app', async () => {
    await import('./index');

    expect(whenReady).toHaveBeenCalled();
    expect(appOn).toHaveBeenCalledWith('web-contents-created', expect.any(Function));
    expect(appOn).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
    expect(appOn).toHaveBeenCalledTimes(2);
  });

  it('Creates window properly on app ready', async () => {
    await import('./index');

    const callback = appOn.mock.calls[0][1];

    const contents = { on: vi.fn(), setWindowOpenHandler: vi.fn() };
    callback(0, contents);

    expect(browserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        show: false,
        webPreferences: expect.objectContaining({
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        }),
      }),
    );

    expect(removeMenu).toHaveBeenCalled();
    expect(loadFile).toHaveBeenCalledWith(expect.any(String));
    expect(openDevTools).toHaveBeenCalled();
    expect(mainWindowOn).toHaveBeenCalledWith('closed', expect.any(Function));

    // TODO: Find a way to check if the window was set to undefined
    // expect()
  });

  it('Handles navigation events', async () => {
    await import('./index');

    const callback = appOn.mock.calls[1][1];

    const onMock = vi.fn();
    callback({}, { on: onMock });

    const willNavigateCallback: (event: object) => void = onMock.mock.calls[0][1];
    const newWindowCallback: (event: object, navigationUrl: string) => void = onMock.mock.calls[1][1];

    expect(onMock).toHaveBeenCalledWith('will-navigate', willNavigateCallback);
    expect(onMock).toHaveBeenCalledWith('new-window', newWindowCallback);

    const eventMock = { preventDefault: vi.fn() };
    willNavigateCallback(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();

    newWindowCallback(eventMock, 'http://hacker.com');

    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(shell.openExternal).toHaveBeenCalledWith('http://hacker.com');
  });

  it('Quits when all windows are closed', async () => {
    await import('./index');

    const callback = appOn.mock.calls[2][1];

    expect(callback).toBeInstanceOf(Function);
    expect(quit).not.toHaveBeenCalled();

    callback();

    expect(quit).toHaveBeenCalledTimes(1);
  });

  it('Loads different file and does not open devtools in production', async () => {
    openDevTools.mockImplementationOnce(() => false);

    await import('./index');

    const appReadyCallback = appOn.mock.calls[0][1];

    appReadyCallback();

    expect(openDevTools).not.toHaveBeenCalled();
    expect(loadFile).toHaveBeenCalledWith(expect.stringContaining('dist/'));
  });
});
