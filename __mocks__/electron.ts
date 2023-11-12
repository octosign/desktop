import { vi } from 'vitest';

// Mocks
export const appOn = vi.fn();
export const whenReady = vi.fn(() => Promise.resolve());
export const removeMenu = vi.fn();
export const loadFile = vi.fn();
export const openDevTools = vi.fn();
export const mainWindowOn = vi.fn();
export const quit = vi.fn();
export const browserWindow = vi.fn(() => ({
  removeMenu,
  loadFile,
  webContents: {
    openDevTools,
  },
  on: mainWindowOn,
}));

export const showOpenDialog = vi.fn();
export const showSaveDialog = vi.fn();

// Real functionality
export const app = { on: appOn, quit, whenReady }
export const BrowserWindow = browserWindow;
export const dialog = { showOpenDialog, showSaveDialog };
export const shell = { openExternal: vi.fn() };
