/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra';

import Backend from './Backend';

describe('Backend Manager', () => {
  beforeAll(() => {
    jest.mock('fs-extra', () => {
      const fsExtra = jest.genMockFromModule<typeof fs>('fs-extra');
      fsExtra.readdir = () => new Promise<string[]>(resolve => resolve(['stamper', 'signer']));

      return fsExtra;
    });
  });

  afterAll(() => {
    jest.unmock('fs-extra');
  });

  it('Lists all loaded backends', async () => {
    const BackendManager = require('./BackendManager').default;
    const manager = new BackendManager('./backends');

    expect(await manager.list()).toStrictEqual([new Backend(), new Backend()]);
  });
});
