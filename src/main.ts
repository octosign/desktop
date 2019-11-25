import { app, BrowserWindow, shell, session, protocol } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import interceptStreamProtocol from './main/interceptStreamProtocol';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;

function createWindow() {
  if (!session.defaultSession) {
    throw new Error('No default session');
  }

  protocol.interceptStreamProtocol('file', interceptStreamProtocol());

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 640,
    minWidth: 860,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#fafafa',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  });
  mainWindow.removeMenu();

  mainWindow.loadFile('./ui/index.html');

  //if (isDev) {
  mainWindow.webContents.openDevTools({
    mode: 'detach',
    activate: true,
  });
  //}

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
