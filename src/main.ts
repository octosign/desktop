import { app, BrowserWindow, shell, session } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;

function createWindow() {
  if (!session.defaultSession) {
    throw new Error('No default session');
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  });
  mainWindow.removeMenu();
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' data"],
      },
    });
  });

  mainWindow.loadFile('./ui/index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
    });
  }

  mainWindow.on('closed', function() {
    mainWindow = undefined;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Prevent all navigation and creation of new windows
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', event => event.preventDefault());
});
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', async (event, navigationUrl) => {
    event.preventDefault();
    await shell.openExternal(navigationUrl);
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());
