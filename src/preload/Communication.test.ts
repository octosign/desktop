/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ChildProcess } from 'child_process';

import Communication from './Communication';

const stdInMock = { write: jest.fn() };
const stdOutMock = {
  pipe: jest.fn(() => stdOutMock),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
} as { pipe: jest.Mock; on: jest.Mock; removeAllListeners: jest.Mock };
const stdErrMock = { on: jest.fn(), removeAllListeners: jest.fn() };
const processMock = jest.fn(() => ({
  on: jest.fn<ChildProcess, [string, (...args: unknown[]) => void]>(),
  once: jest.fn<ChildProcess, [string, (...args: unknown[]) => void]>(),
  removeAllListeners: jest.fn(),
  get stdin() {
    return stdInMock;
  },
  get stdout() {
    return stdOutMock;
  },
  get stderr() {
    return stdErrMock;
  },
  get killed() {
    return false;
  },
  kill: jest.fn(),
}))();

describe('Communication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Handles exit code 0 by resolving and cleaning up', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];

    if (!onExitCallback) throw new Error('Callback not defined');

    onExitCallback(0);
    const result = await communication;

    expect(result).toBe(undefined);
    expect(processMock.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stdout.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stderr.removeAllListeners).toHaveBeenCalled();
  });

  it('Handles exit code other than 0 by rejecting and cleaning up', () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];

    if (!onExitCallback) throw new Error('Callback not defined');

    onExitCallback(1);

    expect(communication).rejects.toBe(1);
    expect(processMock.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stdout.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stderr.removeAllListeners).toHaveBeenCalled();
  });

  it('Handles communication errors by rejecting and cleaning up', () => {
    const onError = jest.fn();
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      onError,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onErrorCall = processMock.on.mock.calls.find(c => c[0] === 'error');
    const onErrorCallback = onErrorCall && onErrorCall[1];

    if (!onErrorCallback) throw new Error('Callback not defined');

    onErrorCallback(new Error('File not found'));

    expect(communication).rejects.toBe(1);
    expect(processMock.kill).toHaveBeenCalledWith('SIGKILL');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('File not found'));
    expect(processMock.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stdout.removeAllListeners).toHaveBeenCalled();
    expect(processMock.stderr.removeAllListeners).toHaveBeenCalled();
  });

  it('Handles issue with STDIO piping not being available', async () => {
    const onError = jest.fn();
    // @ts-ignore
    jest.spyOn(processMock, 'stdin', 'get').mockReturnValueOnce(null);
    // @ts-ignore
    jest.spyOn(processMock, 'stdout', 'get').mockReturnValueOnce(null);
    // @ts-ignore
    jest.spyOn(processMock, 'stderr', 'get').mockReturnValueOnce(null);

    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      onError,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    await expect(communication).rejects.toBe(252);
    expect(processMock.kill).toHaveBeenCalledWith('SIGKILL');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('communication'));
    expect(processMock.removeAllListeners).toHaveBeenCalled();
  });

  it('Does not send SIGKILL if process is already killed on communication error', async () => {
    const onError = jest.fn();
    // @ts-ignore
    jest.spyOn(processMock, 'killed', 'get').mockReturnValueOnce(true);

    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      onError,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onErrorCall = processMock.on.mock.calls.find(c => c[0] === 'error');
    const onErrorCallback = onErrorCall && onErrorCall[1];

    if (!onErrorCallback) throw new Error('Callback not defined');

    onErrorCallback(new Error('File not found'));

    await expect(communication).rejects.toBe(1);
    expect(processMock.kill).not.toHaveBeenCalledWith('SIGKILL');
  });

  it('Does not send SIGKILL if process is already killed on STDIO piping issues', async () => {
    const onError = jest.fn();
    // @ts-ignore
    jest.spyOn(processMock, 'stdin', 'get').mockReturnValueOnce(null);
    // @ts-ignore
    jest.spyOn(processMock, 'killed', 'get').mockReturnValueOnce(true);

    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      onError,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    await expect(communication).rejects.toBe(252);
    expect(processMock.kill).not.toHaveBeenCalledWith('SIGKILL');
  });

  it('Handles STDERR by aggregating', () => {
    jest.useFakeTimers();

    const onError = jest.fn();
    new Communication(
      (processMock as unknown) as ChildProcess,
      onError,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onStdErr = processMock.stderr.on.mock.calls.find(c => c[0] === 'data');
    const onStdErrCallback = onStdErr && onStdErr[1];

    if (!onStdErrCallback) throw new Error('Callback not defined');

    onStdErrCallback('Some Horrible Exc');
    onStdErrCallback('eption');

    expect(onError).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(onError).toHaveBeenCalledWith('Some Horrible Exception');

    jest.useRealTimers();
  });

  it('Handles valid STDOUT PROMPT with response on STDIN', async () => {
    const onPrompt = jest.fn();
    new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      onPrompt,
      () => Promise.resolve(''),
    ).handle();

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];

    if (!onStdOutCallback) throw new Error('Callback not defined');

    onPrompt.mockResolvedValueOnce('Something');

    await onStdOutCallback('--PROMPT--\n');
    await onStdOutCallback('image"Signature file"("Default")\n');
    await onStdOutCallback('--PROMPT--\n');

    expect(onPrompt).toHaveBeenCalledWith({
      promptType: 'image',
      question: 'Signature file',
      defaultValue: 'Default',
    });
    expect(processMock.stdin.write).toHaveBeenCalledWith(`--PROMPT--\nSomething\n--PROMPT--\n`);
  });

  it('Handles invalid STDOUT PROMPT with empty response on STDIN', async () => {
    const onPrompt = jest.fn();
    new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      onPrompt,
      () => Promise.resolve(''),
    ).handle();

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];

    if (!onStdOutCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--PROMPT--\n');
    await onStdOutCallback('imaignature fileDefault")\n');
    await onStdOutCallback('--PROMPT--\n');

    expect(onPrompt).not.toHaveBeenCalled();
    expect(processMock.stdin.write).toHaveBeenCalledWith(`--PROMPT--\n\n--PROMPT--\n`);
  });

  it('Handles STDOUT GETOPTION', async () => {
    const onGetOption = jest.fn();
    new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      onGetOption,
    ).handle();

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];

    if (!onStdOutCallback) throw new Error('Callback not defined');

    onGetOption.mockResolvedValueOnce('Something');

    await onStdOutCallback('--GETOPTION--\n');
    await onStdOutCallback('dllPath\n');
    await onStdOutCallback('--GETOPTION--\n');

    expect(onGetOption).toHaveBeenCalledWith('dllPath');
    expect(processMock.stdin.write).toHaveBeenCalledWith(
      `--GETOPTION--\nSomething\n--GETOPTION--\n`,
    );
  });

  it('Handles multiline STDOUT RESULT ignoring anything outside delimiter', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle();

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('gibberish\n');
    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('Multi\n');
    await onStdOutCallback('line\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual(['Multi', 'line']);
  });
});
