import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

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
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: process.env.SPECTRON === '1',
      preload: join(__dirname, 'preload.js'),
    },
  });
  mainWindow.removeMenu();

  mainWindow.loadFile(isDev ? 'ui/index.html' : 'dist/ui/index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
      activate: true,
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
  contents.on('new-window', async (event, navigationUrl) => {
    event.preventDefault();
    await shell.openExternal(navigationUrl);
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());
