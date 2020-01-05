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

    expect(await manager.list()).toStrictEqual({
      stamper: new Backend(
        {
          name: 'Stamper',
          version: '0.1.0',
          exec: `.${sep}stamp`,
          build: './dist',
        },
        join('backends/stamper'),
      ),
      signer: new Backend(
        {
          name: 'Signer',
          version: '9001.0.0',
          exec: `.${sep}sign`,
          build: './build',
        },
        join('backends/signer'),
      ),
    });
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
});
