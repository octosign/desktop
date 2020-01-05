import { remote } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

import BackendManager from './main/BackendManager';

const backendsPath = isDev
  ? join(remote.app.getAppPath(), '../backends/dist')
  : join(remote.app.getAppPath(), '../backends');

window.apiReady = (async () => {
  const manager = new BackendManager(backendsPath);
  await manager.load();
  const backend = manager.get('dss');

  window.OctoSign = {
    sign: path => backend.sign(path),
  };
})();

window.showWindow = () => {
  const currentWindow = remote.getCurrentWindow();
  currentWindow.show();
};

// Allow require for spectron
if (process.env.SPECTRON === '1') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  window.spectronRequire = require;
}
