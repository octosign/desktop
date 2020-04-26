import os from 'os';
import fs from 'fs';
import path from 'path';

describe('Settings', () => {
  beforeAll(() => {
    jest.mock('electron', () => ({
      app: {
        getPath: () => os.tmpdir(),
      },
    }));
  });

  beforeEach(() => {
    const configPath = path.join(os.tmpdir(), 'testConfig.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  it('Defines defaults from options', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    expect(settings.getDefaults()).toStrictEqual({
      signer: {
        test: 'test',
      },
    });
  });

  it('Provides values from the store on get', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    expect({ ...settings.get() }).toStrictEqual({
      signer: {
        test: 'test',
      },
    });
  });

  it('Can get one value from the store', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    expect(settings.get('signer.test')).toBe('test');
  });

  it('Sets data on set', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    settings.set({ signer: { test: 'neotest' } });

    expect({ ...settings.get() }).toStrictEqual({ signer: { test: 'neotest' } });
  });

  it('Can restore settings in the config to their defaults', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    settings.set({ signer: { test: 'neotest' } });

    expect({ ...settings.get() }).toStrictEqual({
      signer: {
        test: 'neotest',
      },
    });

    settings.reset();

    expect({ ...settings.get() }).toStrictEqual({
      signer: {
        test: 'test',
      },
    });
  });

  it('Allows getting options used during creation', () => {
    const Settings = require('./Settings').default;
    const settings = new Settings(
      {
        signer: [
          {
            id: 'test',
            label: 'Test',
            defaultValue: 'test',
          },
        ],
      },
      'testConfig',
    );

    expect(settings.getOptions()).toStrictEqual({
      signer: [
        {
          id: 'test',
          label: 'Test',
          defaultValue: 'test',
        },
      ],
    });
  });
});
