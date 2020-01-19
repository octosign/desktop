const appOn = jest.fn();
const removeMenu = jest.fn();
const loadFile = jest.fn();
const openDevTools = jest.fn();
const mainWindowOn = jest.fn();
const quit = jest.fn();
const browserWindow = jest.fn(() => ({
  removeMenu,
  loadFile,
  webContents: {
    openDevTools,
  },
  on: mainWindowOn,
}));
const shell = {
  openExternal: jest.fn(),
};
const electronMock = {
  app: {
    on: appOn,
    quit,
  },
  BrowserWindow: browserWindow,
  shell,
};

describe('Main', () => {
  beforeAll(() => {
    jest.mock('electron', () => electronMock);
  });

  afterAll(() => {
    jest.unmock('electron');
  });

  beforeEach(() => {
    jest.resetModules();
    appOn.mockReset();
    openDevTools.mockReset();
  });

  it('Registers callbacks on the app', () => {
    require('./main');

    expect(appOn).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(appOn).toHaveBeenCalledWith('web-contents-created', expect.any(Function));
    expect(appOn).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
    expect(appOn).toHaveBeenCalledTimes(3);
  });

  it('Creates window properly on app ready', () => {
    require('./main');

    const callback = appOn.mock.calls[0][1];

    callback();

    expect(browserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        show: false,
        webPreferences: expect.objectContaining({
          contextIsolation: false,
          nodeIntegration: false,
        }),
      }),
    );

    expect(removeMenu).toHaveBeenCalled();
    expect(loadFile).toHaveBeenCalledWith(expect.any(String));
    expect(openDevTools).toHaveBeenCalled();
    expect(mainWindowOn).toHaveBeenCalledWith('closed', expect.any(Function));
    mainWindowOn.mock.calls[0][1]();

    // TODO: Find a way to check if the window was set to undefined
    // expect()
  });

  it('Handles navigation events', () => {
    require('./main');

    const callback = appOn.mock.calls[1][1];

    const onMock = jest.fn();
    callback({}, { on: onMock });

    const willNavigateCallback: (event: {}) => void = onMock.mock.calls[0][1];
    const newWindowCallback: (event: {}, navigationUrl: string) => void = onMock.mock.calls[1][1];

    expect(onMock).toHaveBeenCalledWith('will-navigate', willNavigateCallback);
    expect(onMock).toHaveBeenCalledWith('new-window', newWindowCallback);

    const eventMock = { preventDefault: jest.fn() };
    willNavigateCallback(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();

    newWindowCallback(eventMock, 'http://hacker.com');

    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(shell.openExternal).toHaveBeenCalledWith('http://hacker.com');
  });

  it('Quits when all windows are closed', () => {
    require('./main');

    const callback = appOn.mock.calls[2][1];

    expect(callback).toBeInstanceOf(Function);
    expect(quit).not.toHaveBeenCalled();

    callback();

    expect(quit).toHaveBeenCalledTimes(1);
  });

  it('Loads different file and does not open devtools in production', () => {
    jest.mock('electron-is-dev', () => false);

    require('./main');

    const appReadyCallback = appOn.mock.calls[0][1];

    appReadyCallback();

    expect(openDevTools).not.toHaveBeenCalled();
    expect(loadFile).toHaveBeenCalledWith(expect.stringContaining('dist/'));
  });
});
