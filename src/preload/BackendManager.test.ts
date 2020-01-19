/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra';

import Backend from './Backend';
import { join, sep } from 'path';

const readFileMock = jest.fn();
describe('Backend Manager', () => {
  beforeAll(() => {
    jest.mock('fs-extra', () => {
      const fsExtra = jest.genMockFromModule<typeof fs>('fs-extra');
      fsExtra.readdir = () => new Promise<string[]>(resolve => resolve(['stamper', 'signer']));
      fsExtra.readFile = readFileMock;

      return fsExtra;
    });
  });

  afterAll(() => {
    jest.unmock('fs-extra');
  });

  it('Lists all loaded backends', async () => {
    const BackendManager = require('./BackendManager').default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nversion: 0.1.0\nexec: ./stamp\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nversion: 9001.0.0\nexec: ./sign\nbuild: ./build`);

    await manager.load();

    expect(await manager.list()).toStrictEqual([
      {
        available: true,
        config: {
          name: 'Signer',
          version: '9001.0.0',
          exec: `.${sep}sign`,
          build: './build',
        },
        slug: 'signer',
      },
      {
        available: true,
        config: {
          name: 'Stamper',
          version: '0.1.0',
          exec: `.${sep}stamp`,
          build: './dist',
        },
        slug: 'stamper',
      },
    ]);
  });

  it('Retrieves loaded backend', async () => {
    const BackendManager = require('./BackendManager').default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign\nbuild: ./build`);

    await manager.load();

    expect(await manager.get('stamper')).toStrictEqual(
      new Backend(
        { name: 'Stamper', version: 'dev', exec: `.${sep}stamp`, build: './dist' },
        join('backends/stamper'),
      ),
    );
  });

  it('Removes .exe from exec if not on windows', async () => {
    const BackendManager = require('./BackendManager').default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp.exe\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign.exe\nbuild: ./build`);

    const platform = process.platform;

    Object.defineProperty(process, 'platform', { value: 'win32' });
    await manager.load();

    expect(await manager.get('stamper')).toStrictEqual(
      new Backend(
        { name: 'Stamper', version: 'dev', exec: `.${sep}stamp.exe`, build: './dist' },
        join('backends/stamper'),
      ),
    );

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp.exe\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign.exe\nbuild: ./build`);

    Object.defineProperty(process, 'platform', { value: 'darwin' });
    await manager.load();

    expect(await manager.get('stamper')).toStrictEqual(
      new Backend(
        { name: 'Stamper', version: 'dev', exec: `.${sep}stamp`, build: './dist' },
        join('backends/stamper'),
      ),
    );

    Object.defineProperty(process, 'platform', { value: platform });
  });
});
