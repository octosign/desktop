
import { vi } from 'vitest';

const readFileMock = vi.fn();
const backendMetaMock = vi.fn(() =>
  Promise.resolve({
    status: 'OK',
  }),
);
vi.mock('node:fs/promises', async () => {
  const fs = (await import('node:fs/promises')).default;

  const fsMock = vi.mocked(fs);
  // @ts-expect-error Simplified mock
  fsMock.readdir = () => new Promise(resolve => resolve([
    { name: 'stamper', isDirectory: () => true },
    { name: 'signer', isDirectory: () => true },
    { name: 'else', isDirectory: () => false },
    { name: 'dist', isDirectory: () => true },
  ]));
  fsMock.readFile = readFileMock;

  return { default: fsMock };
});

function BackendMock(config: object) {
  return {
    getConfig: () => config,
    meta: backendMetaMock,
    sign: () => 0,
    verify: () => 0,
  };
}
vi.mock('./Backend', () => ({ default: BackendMock }));

describe('Backend Manager', () => {
  it('Lists all loaded backends', async () => {
    const BackendManager = (await import('./BackendManager')).default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nversion: 0.1.0\nexec: ./stamp\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nversion: 9001.0.0\nexec: ./sign\nbuild: ./build`);

    backendMetaMock.mockReturnValueOnce(
      Promise.resolve({
        status: 'Unavailable due to acute shortage of cats.',
        supports: ['application/pdf'],
        options: [
          {
            id: 'dllPath',
            label: 'PKCS #11 Library Path',
            defaultValue: 'some/path.dll',
          },
        ],
      }),
    );

    await manager.load();

    expect(await manager.list()).toStrictEqual([
      {
        available: true,
        config: {
          name: 'Signer',
          version: '9001.0.0',
          exec: `./sign`,
          build: './build',
        },
        options: undefined,
        slug: 'signer',
        supports: undefined,
      },
      {
        available: 'Unavailable due to acute shortage of cats.',
        config: {
          name: 'Stamper',
          version: '0.1.0',
          exec: `./stamp`,
          build: './dist',
        },
        slug: 'stamper',
        options: [
          {
            id: 'dllPath',
            label: 'PKCS #11 Library Path',
            defaultValue: 'some/path.dll',
          },
        ],
        supports: ['application/pdf'],
      },
    ]);
  });

  it('Retrieves loaded backend', async () => {
    const BackendManager = (await import('./BackendManager')).default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign\nbuild: ./build`);

    await manager.load();

    expect((await manager.get('stamper')).getConfig()).toStrictEqual({
      name: 'Stamper',
      exec: `./stamp`,
      build: './dist',
    });
  });

  it('Removes .exe from exec if not on windows', async () => {
    const BackendManager = (await import('./BackendManager')).default;
    const manager = new BackendManager('./backends');

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp.exe\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign.exe\nbuild: ./build`);

    const platform = process.platform;

    Object.defineProperty(process, 'platform', { value: 'win32' });
    await manager.load();

    expect((await manager.get('stamper')).getConfig()).toStrictEqual({
      name: 'Stamper',
      exec: `./stamp.exe`,
      build: './dist',
    });

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nexec: ./stamp.exe\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nexec: ./sign.exe\nbuild: ./build`);

    Object.defineProperty(process, 'platform', { value: 'darwin' });
    await manager.load();

    expect((await manager.get('stamper')).getConfig()).toStrictEqual({
      name: 'Stamper',
      exec: `./stamp`,
      build: './dist',
    });

    Object.defineProperty(process, 'platform', { value: platform });
  });

  it('Gets metadata for all backends during load', async () => {
    const BackendManager = (await import('./BackendManager')).default;
    const manager = new BackendManager('./backends');

    backendMetaMock.mockClear();

    readFileMock
      .mockReturnValueOnce(`name: Stamper\nversion: 0.1.0\nexec: ./stamp\nbuild: ./dist`)
      .mockReturnValueOnce(`name: Signer\nversion: 9001.0.0\nexec: ./sign\nbuild: ./build`);

    await manager.load();

    expect(backendMetaMock).toHaveBeenCalledTimes(2);

    expect(manager.listMetadata()).toStrictEqual({
      stamper: { status: 'OK' },
      signer: { status: 'OK' },
    });
  });
});
