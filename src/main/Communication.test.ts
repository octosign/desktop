import { ChildProcess } from 'child_process';
import { Mock, vi } from 'vitest';

import Communication from './Communication';

const stdInMock = { write: vi.fn() };
const stdOutMock = {
  pipe: vi.fn(() => stdOutMock),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
} as { pipe: Mock; on: Mock; removeAllListeners: Mock };
const stdErrMock = { on: vi.fn(), removeAllListeners: vi.fn() };
const processMock = vi.fn(() => ({
  on: vi.fn<[string, (...args: unknown[]) => void], ChildProcess>(),
  once: vi.fn<[string, (...args: unknown[]) => void], ChildProcess>(),
  removeAllListeners: vi.fn(),
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
  kill: vi.fn(),
}))();

describe('Communication', () => {
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
    const onError = vi.fn();
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
    const onError = vi.fn();
    // @ts-expect-error Simplified mock
    vi.spyOn(processMock, 'stdin', 'get').mockReturnValueOnce(null);
    // @ts-expect-error Simplified mock
    vi.spyOn(processMock, 'stdout', 'get').mockReturnValueOnce(null);
    // @ts-expect-error Simplified mock
    vi.spyOn(processMock, 'stderr', 'get').mockReturnValueOnce(null);

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
    const onError = vi.fn();
    vi.spyOn(processMock, 'killed', 'get').mockReturnValueOnce(true);

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
    const onError = vi.fn();
    // @ts-expect-error Simplified mock
    vi.spyOn(processMock, 'stdin', 'get').mockReturnValueOnce(null);
    vi.spyOn(processMock, 'killed', 'get').mockReturnValueOnce(true);

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
    vi.useFakeTimers();

    const onError = vi.fn();
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

    vi.runAllTimers();

    expect(onError).toHaveBeenCalledWith('Some Horrible Exception');

    vi.useRealTimers();
  });

  it('Handles valid STDOUT PROMPT with response on STDIN', async () => {
    const onPrompt = vi.fn();
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

  it('Handles valid STDOUT PROMPT including options with response on STDIN', async () => {
    const onPrompt = vi.fn();
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
    await onStdOutCallback('single"Pick one wisely"("1")[1"One" 2"Two" 3"Three"]\n');
    await onStdOutCallback('--PROMPT--\n');

    expect(onPrompt).toHaveBeenCalledWith({
      promptType: 'single',
      question: 'Pick one wisely',
      defaultValue: '1',
      options: [
        { key: '1', value: 'One' },
        { key: '2', value: 'Two' },
        { key: '3', value: 'Three' },
      ],
    });
    expect(processMock.stdin.write).toHaveBeenCalledWith(`--PROMPT--\nSomething\n--PROMPT--\n`);
  });

  it('Handles invalid STDOUT PROMPT with empty response on STDIN', async () => {
    const onPrompt = vi.fn();
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
    const onGetOption = vi.fn();
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

  it('Handles meta STDOUT RESULT', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('meta');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('OK\n');
    await onStdOutCallback('SUPPORTS:application/pdf\n');
    await onStdOutCallback('OPTIONS:testKey"Please fill this out"("def")\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'OK',
      supports: ['application/pdf'],
      options: [
        {
          id: 'testKey',
          label: 'Please fill this out',
          defaultValue: 'def',
        },
      ],
    });
  });

  it('Handles meta STDOUT RESULT with only error', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('meta');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('Error happens\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'Error happens',
      options: undefined,
      supports: undefined,
    });
  });

  it('Handles meta STDOUT RESULT with empty options and supports', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('meta');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('Error happens\n');
    await onStdOutCallback('SUPPORTS:\n');
    await onStdOutCallback('OPTIONS:\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'Error happens',
      options: undefined,
      supports: undefined,
    });
  });

  it('Handles sign optional STDOUT RESULT', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('sign');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('output/path.pdf\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual('output/path.pdf');
  });

  it('Handles verify STDOUT RESULT with known status and details', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('verify');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('SIGNED\n');
    await onStdOutCallback('More\n');
    await onStdOutCallback('Details\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'SIGNED',
      details: 'More\nDetails',
    });
  });

  it('Handles verify STDOUT RESULT with unknown status without details', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('verify');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('ELSE\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'UNKNOWN',
      details: undefined,
    });
  });

  it('Handles verify STDOUT RESULT with translated details', async () => {
    const communication = new Communication(
      (processMock as unknown) as ChildProcess,
      () => 0,
      () => Promise.resolve(''),
      () => Promise.resolve(''),
    ).handle('verify');

    const onStdOut = processMock.stdout.on.mock.calls.find(c => c[0] === 'data');
    const onStdOutCallback = onStdOut && onStdOut[1];
    if (!onStdOutCallback) throw new Error('Callback not defined');

    const onExitCall = processMock.once.mock.calls.find(c => c[0] === 'exit');
    const onExitCallback = onExitCall && onExitCall[1];
    if (!onExitCallback) throw new Error('Callback not defined');

    await onStdOutCallback('--RESULT--\n');
    await onStdOutCallback('SIGNED\n');
    await onStdOutCallback('Signed by t{translated}\n');
    await onStdOutCallback('--RESULT--\n');

    onExitCallback(0);

    const result = await communication;

    expect(result).toStrictEqual({
      status: 'SIGNED',
      details: 'Signed by translated',
    });
  });
});
