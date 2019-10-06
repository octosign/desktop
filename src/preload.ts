import Backend from './main/Backend';

const backend = new Backend();

window.OctoSign = {
  sign: path => backend.sign(path),
};
