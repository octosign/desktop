import { remote } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import { file } from 'tmp-promise';
import mime from 'mime-types';
import { writeFile } from 'fs-extra';

import BackendManager from './preload/BackendManager';
import Backend from './preload/Backend';
import Settings from './preload/Settings';
import { BackendOption } from './shared/BackendResults';

const backendsPath = isDev
  ? join(remote.app.getAppPath(), '../backends/dist')
  : join(remote.app.getAppPath(), '../backends');

window.apiReady = (async () => {
  const manager = new BackendManager(backendsPath);
  await manager.load();
  let backend: Backend;
  let backendSlug: string;

  const metadata = manager.listMetadata();
  const allOptions = Object.keys(metadata).reduce((acc, key) => {
    const options = metadata[key].options;
    if (options) acc[key] = options;
    return acc;
  }, {} as { [key: string]: BackendOption[] });
  const settings = new Settings(allOptions);
  const onGetOption = (id: string) => settings.get(`${backendSlug}.${id}`);

  window.OctoSign = {
    list: async () => manager.list(),
    set: async slug => {
      backend = await manager.get(slug);
      backendSlug = slug;
    },
    sign: (path, onError, onPrompt) => backend?.sign(path, onError, onPrompt, onGetOption),
    verify: (path, onError, onPrompt) => backend?.verify(path, onError, onPrompt, onGetOption),
    getOptionValues: () => settings.get(),
    setOptionValues: values => settings.set(values),
  };
})();

window.showWindow = () => {
  const currentWindow = remote.getCurrentWindow();
  currentWindow.show();
};

window.createTmpImage = async data => {
  const parts = data.split(',');
  const header = parts[0].match(/data:(.*);base64/);
  if (!header) throw new Error('Can not parse image format');
  const ext = mime.extension(header[1]);
  const { path } = await file({ postfix: `.${ext}` });
  const buffer = Buffer.from(parts[1], 'base64');

  await writeFile(path, buffer);

  return path;
};

window.getVersion = () => remote.app.getVersion();

// Allow require for spectron
if (process.env.SPECTRON === '1') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  window.spectronRequire = require;
}
