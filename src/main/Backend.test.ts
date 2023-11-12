/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec, ChildProcess } from 'child_process';
import { Mock, vi } from 'vitest';
import { dialog } from 'electron';

import PromptRequest from '../shared/PromptRequest';

const communicationMock = vi.fn(
  (
    _exec: ChildProcess,
    _onError: (err: string) => void,
    _onPrompt: (request: PromptRequest) => string,
    _filePath?: string,
  ) => ({
    handle: () => Promise.resolve(123),
  }),
);
vi.mock('./Communication', () => ({ default: communicationMock }));

describe('Backend', () => {
  it('Can be created using a config', async () => {
    const Backend = (await import('./Backend')).default;

    const backend = new Backend(
      {
        name: 'Test',
        description: 'Some desc',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    expect(backend.getConfig()).toMatchObject({
      name: 'Test',
      description: 'Some desc',
      exec: './backend',
      build: './build',
    });
  });

  it('Should exec meta operation on meta and handle communication', async () => {
    const Backend = (await import('./Backend')).default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    const resolution = await backend.meta();

    expect(exec).toHaveBeenCalledWith(`./backend meta`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Should exec sign operation on sign and handle communication', async () => {
    const Backend = (await import('./Backend')).default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    const resolution = await backend.sign('some/path.pdf', vi.fn(), vi.fn(), vi.fn());

    expect(exec).toHaveBeenCalledWith(`./backend sign 'some/path.pdf'`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Should exec verify operation on verify and handle communication', async () => {
    const Backend = (await import('./Backend')).default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    const resolution = await backend.verify('some/path.pdf', vi.fn(), vi.fn(), vi.fn());

    expect(exec).toHaveBeenCalledWith(`./backend verify 'some/path.pdf'`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Handles errors', async () => {
    const Backend = (await import('./Backend')).default;

    const onError = vi.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    communicationMock.mockClear();

    await backend.sign('some/file.pdf', onError, vi.fn(), vi.fn());

    const passedOnError = communicationMock.mock.calls[0][1];
    passedOnError('Your computer is on fire. Sorry!');
    expect(onError).toHaveBeenCalledWith('Your computer is on fire. Sorry!');
  });

  it('Handles open and save prompts', async () => {
    const Backend = (await import('./Backend')).default;

    const onPrompt = vi.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    communicationMock.mockClear();

    await backend.sign('some/file.pdf', vi.fn(), onPrompt, vi.fn());
    (dialog.showSaveDialog as Mock).mockReturnValueOnce({ filePath: '/save/path', canceled: false });
    (dialog.showOpenDialog as Mock).mockReturnValueOnce({ filePaths: ['/open/path'], canceled: false });

    const passedOnPrompt = communicationMock.mock.calls[0][2];
    let promptResult = await passedOnPrompt({
      promptType: 'save',
      question: 'Save your documents',
      defaultValue: '/hmo',
    });
    expect(dialog.showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Save your documents', defaultPath: '/hmo' }),
    );
    expect(promptResult).toBe('/save/path');

    promptResult = await passedOnPrompt({
      promptType: 'open',
      question: 'Give me your documents',
      defaultValue: '/hm',
    });
    expect(dialog.showOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Give me your documents', defaultPath: '/hm' }),
    );
    expect(promptResult).toBe('/open/path');
  });

  it('Handles open and save prompts when picking is cancelled', async () => {
    const Backend = (await import('./Backend')).default;

    const onPrompt = vi.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    communicationMock.mockClear();

    await backend.sign('some/file.pdf', vi.fn(), onPrompt, vi.fn());
    (dialog.showSaveDialog as Mock).mockReturnValueOnce({ canceled: true });
    (dialog.showOpenDialog as Mock).mockReturnValueOnce({ filePaths: [], canceled: true });

    const passedOnPrompt = communicationMock.mock.calls[0][2];
    let promptResult = await passedOnPrompt({
      promptType: 'save',
      question: 'Save your doc',
      defaultValue: '',
    });
    expect(promptResult).toBe('');

    promptResult = await passedOnPrompt({
      promptType: 'open',
      question: 'Give me your doc',
      defaultValue: '',
    });
    expect(promptResult).toBe('');
  });

  it('Passes handles of prompts it can not handle directly', async () => {
    const Backend = (await import('./Backend')).default;

    const onPrompt = vi.fn<unknown[], Promise<string | undefined>>(() => Promise.resolve(''));

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    communicationMock.mockClear();

    await backend.sign('some/file.pdf', vi.fn(), onPrompt, vi.fn());

    const passedOnPrompt = communicationMock.mock.calls[0][2];
    let promptResult = await passedOnPrompt({
      promptType: 'boolean',
      question: 'Is there a meaning of life?',
      defaultValue: '',
    });
    expect(onPrompt).toHaveBeenCalledWith({
      promptType: 'boolean',
      question: 'Is there a meaning of life?',
      defaultValue: '',
    });
    expect(promptResult).toBe('');

    onPrompt.mockReturnValue(Promise.resolve(undefined));
    promptResult = await passedOnPrompt({
      promptType: 'boolean',
      question: 'Is there a meaning of life?',
      defaultValue: '',
    });
    expect(promptResult).toBe('');
  });

  it('Does not support errors or prompts during meta operation', async () => {
    const Backend = (await import('./Backend')).default;

    const onError = vi.fn();
    const onPrompt = vi.fn<unknown[], boolean | undefined>(() => true);

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        build: './build',
      },
      '/backends/test',
    );

    communicationMock.mockClear();

    // @ts-expect-error This is expected
    await backend.meta(onError, onPrompt);

    const passedOnPrompt = communicationMock.mock.calls[0][2];
    const promptResult = await passedOnPrompt({
      promptType: 'boolean',
      question: 'Is there a meaning of life?',
      defaultValue: '',
    });
    expect(onPrompt).not.toHaveBeenCalled();
    expect(promptResult).toBe('');

    const consoleWarn = console.warn;
    console.warn = vi.fn();

    const passedOnError = communicationMock.mock.calls[0][1];
    passedOnError('Your computer is on fire. Sorry!');
    expect(onError).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unsupported error'));

    console.warn = consoleWarn;
  });

  it.todo('Handles get option');
});
