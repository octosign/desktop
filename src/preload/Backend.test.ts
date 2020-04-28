/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec, ChildProcess } from 'child_process';
import PromptRequest from '../shared/PromptRequest';

const communicationMock = jest.fn(
  (
    exec: ChildProcess,
    onError: (err: string) => void,
    onPrompt: (request: PromptRequest) => string,
    filePath?: string,
  ) => ({
    handle: () => Promise.resolve(123),
  }),
);

const showOpenDialog = jest.fn();
const showSaveDialog = jest.fn();

describe('Backend', () => {
  beforeAll(() => {
    jest.mock('./Communication', () => communicationMock);
    jest.mock('electron', () => ({ remote: { dialog: { showOpenDialog, showSaveDialog } } }));
  });

  afterAll(() => {
    jest.unmock('./Communication');
    jest.unmock('electron');
  });

  it('Can be created using a config', () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    expect(backend.getConfig()).toMatchObject({
      name: 'Test',
      exec: './backend',
      dist: './dist',
    });
  });

  it('Should exec meta operation on meta and handle communication', async () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    const resolution = await backend.meta();

    expect(exec).toHaveBeenCalledWith(`./backend meta`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Should exec sign operation on sign and handle communication', async () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    const resolution = await backend.sign('some/path.pdf');

    expect(exec).toHaveBeenCalledWith(`./backend sign 'some/path.pdf'`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Should exec verify operation on verify and handle communication', async () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    const resolution = await backend.verify('some/path.pdf');

    expect(exec).toHaveBeenCalledWith(`./backend verify 'some/path.pdf'`, expect.anything());
    expect(communicationMock).toHaveBeenCalled();
    expect(resolution).toBe(123);
  });

  it('Handles errors', async () => {
    const Backend = require('./Backend').default;
    const onError = jest.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    await backend.sign('some/file.pdf', onError);

    const passedOnError = communicationMock.mock.calls[0][1];
    passedOnError('Your computer is on fire. Sorry!');
    expect(onError).toHaveBeenCalledWith('Your computer is on fire. Sorry!');
  });

  it('Handles open and save prompts', async () => {
    const Backend = require('./Backend').default;
    const onPrompt = jest.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    await backend.sign('some/file.pdf', undefined, onPrompt);
    showSaveDialog.mockReturnValueOnce({ filePath: '/save/path', canceled: false });
    showOpenDialog.mockReturnValueOnce({ filePaths: ['/open/path'], canceled: false });

    const passedOnPrompt = communicationMock.mock.calls[0][2];
    let promptResult = await passedOnPrompt({
      promptType: 'save',
      question: 'Save your documents',
      defaultValue: '/hmo',
    });
    expect(showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Save your documents', defaultPath: '/hmo' }),
    );
    expect(promptResult).toBe('/save/path');

    promptResult = await passedOnPrompt({
      promptType: 'open',
      question: 'Give me your documents',
      defaultValue: '/hm',
    });
    expect(showOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Give me your documents', defaultPath: '/hm' }),
    );
    expect(promptResult).toBe('/open/path');
  });

  it('Handles open and save prompts when picking is cancelled', async () => {
    const Backend = require('./Backend').default;
    const onPrompt = jest.fn();

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    await backend.sign('some/file.pdf', undefined, onPrompt);
    showSaveDialog.mockReturnValueOnce({ canceled: true });
    showOpenDialog.mockReturnValueOnce({ filePaths: [], canceled: true });

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
    const Backend = require('./Backend').default;
    const onPrompt = jest.fn<boolean | undefined, unknown[]>(() => true);

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    await backend.sign('some/file.pdf', undefined, onPrompt);

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
    expect(promptResult).toBe(true);

    onPrompt.mockReturnValue(undefined);
    promptResult = await passedOnPrompt({
      promptType: 'boolean',
      question: 'Is there a meaning of life?',
      defaultValue: '',
    });
    expect(promptResult).toBe('');
  });

  it('Does not support errors or prompts during meta operation', async () => {
    const Backend = require('./Backend').default;
    const onError = jest.fn();
    const onPrompt = jest.fn<boolean | undefined, unknown[]>(() => true);

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

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
    console.warn = jest.fn();

    const passedOnError = communicationMock.mock.calls[0][1];
    passedOnError('Your computer is on fire. Sorry!');
    expect(onError).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unsupported error'));

    console.warn = consoleWarn;
  });

  it.todo('Handles get option');
});
