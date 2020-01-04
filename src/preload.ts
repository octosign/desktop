import { remote } from 'electron';

import Backend from './main/Backend';

const backend = new Backend();

window.OctoSign = {
  sign: path => backend.sign(path),
};

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
