import { SignatureStatus } from '../shared/BackendResults';

const dssBackend = {
  available: 'PKCS 11 DLL not found',
  config: {
    author: 'Jakub Ďuraš <jakub@duras.me>',
    build: 'bash -e ./dist.sh',
    description:
      'Advanced electronic signature usable on PDF and other documents using cryptography. Requires an usable certificate and signing drivers (for example ID cards and readers of EU citizens). Uses Digital Signature Service from European Commission licensed under the LGPL-2.1.',
    exec: './jdk/bin/java -jar ./sign.jar',
    license: 'GNU Lesser General Public License v2.1',
    name: 'Advanced electronic signature',
    repository: 'https://github.com/durasj/octosign-dss',
    version: '0.1.0',
  },
  slug: 'dss',
  options: [
    {
      id: 'dllPath',
      label: 'PKCS #11 Library Path',
      defaultValue: 'some/path.dll',
    },
  ],
};

const imageBackend = {
  available: true,
  config: {
    author: '(duras.me)',
    build: 'bash -e ./build.sh',
    description:
      'Signs PDFs using chosen image or drawn signature. Based on the unipdf library from FoxyUtils ehf licensed under the AGPLv3.',
    exec: './main',
    name: 'Simple image signature',
    version: '0.2.0',
  },
  slug: 'image',
  supports: ['application/pdf'],
};

const mockWindowAPI = (window: Window) => {
  window.OctoSign = {
    list: () => new Promise(resolve => setTimeout(() => resolve([dssBackend, imageBackend]), 500)),
    set: () => Promise.resolve(),
    sign: () => new Promise(resolve => setTimeout(() => resolve(), 1000)),
    verify: (filePath: string) => {
      let result = { status: 'UNKNOWN' } as SignatureStatus;
      if (filePath.includes('signed')) {
        result = { status: 'SIGNED', details: 'Some details' };
      } else if (filePath.includes('invalid')) {
        result = { status: 'INVALID', details: 'Some invalid details' };
      }

      return new Promise(resolve => setTimeout(() => resolve(result), 1000));
    },
    getOptionValues: () => ({ dss: { dllPath: 'dll/path.dll' } }),
    setOptionValues: () => {
      return;
    },
  };

  window.apiReady = Promise.resolve();
  window.showWindow = () => undefined;
  window.getVersion = () => '0.3.0-dev';
};

export default mockWindowAPI;
