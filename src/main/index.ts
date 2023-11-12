import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

import icon from '../../res/icon.png?asset';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 640,
    minWidth: 860,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#fafafa',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  });
  mainWindow.removeMenu();

  mainWindow.on('ready-to-show', () => mainWindow!.show())

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
      activate: true,
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Prevent all navigation and creation of new windows
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', event => event.preventDefault());
  contents.setWindowOpenHandler(({ url }) => {
    // Only allow simplified https:// links to prevent abuse of `open`
    const reqUrl = new URL(url);
    if (reqUrl.protocol === 'https:') {
      setImmediate(() => {
        shell.openExternal(`${reqUrl.origin}${reqUrl.pathname}`)
      })
    }

    return { action: 'deny' }
  })
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());
