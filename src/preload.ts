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
