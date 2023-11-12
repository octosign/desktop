import { ChildProcess } from 'child_process';
import split2 from 'split2';
import { Readable, Writable } from 'stream';

import debounce from '../shared/debounce';
import PromptRequest from '../shared/PromptRequest';
import { BackendMetadata, BackendOption, SignatureStatus } from '../shared/BackendResults';
import i18n from '../shared/i18nSetup';

/**
 * Handles communication with child process following the protocol
 *
 * Protocol: https://github.com/durasj/octosign/wiki/Backend-specification#communication-protocol
 */
class Communication {
  private readonly process: ChildProcess;
  private readonly onError: (message: string) => void;
  private readonly onPrompt: (request: PromptRequest) => Promise<string>;
  private readonly onGetOption: (message: string) => Promise<string>;
  public static readonly EXIT_CODES = {
    SUCCESS: 0,
    GENERAL_ERROR: 1,
    STDIO_ERROR: 252,
  };

  constructor(
    process: ChildProcess,
    onError: (message: string) => void,
    onPrompt: (message: PromptRequest) => Promise<string>,
    onGetOption: (message: string) => Promise<string>,
  ) {
    this.process = process;
    this.onError = onError;
    this.onPrompt = onPrompt;
    this.onGetOption = onGetOption;
  }

  public async handle(resultType?: 'meta' | 'verify' | 'sign') {
    return new Promise((resolve, reject) => {
      let result: string[] | undefined = undefined;

      const exitListener = (code: number) => {
        this.cleanUp();
        if (code !== 0) {
          return reject(code);
        }

        if (resultType === 'meta') {
          resolve(result ? this.processMetaResult(result) : undefined);
        } else if (resultType === 'verify') {
          resolve(result ? this.processVerifyResult(result) : undefined);
        } else if (resultType === 'sign') {
          resolve(result ? result[0] : undefined);
        } else {
          resolve(result);
        }
      };
      const errorListener = (err: Error) => {
        this.cleanUp();
        if (!this.process.killed) this.process.kill('SIGKILL');
        this.onError(i18n.t(`Errored during operation: "{{error}}".`, { error: err.message }));
        reject(Communication.EXIT_CODES.GENERAL_ERROR);
      };

      this.process.once('exit', exitListener);

      this.process.on('error', errorListener);

      if (
        this.process.stdin === null ||
        this.process.stdout === null ||
        this.process.stderr === null
      ) {
        this.cleanUp();
        if (!this.process.killed) this.process.kill('SIGKILL');
        this.onError(i18n.t('Failed to establish communication with signing component.'));
        reject(Communication.EXIT_CODES.STDIO_ERROR);
        return;
      }

      this.handleStdErr(this.process.stderr);
      this.handleStdOut(this.process.stdout, this.process.stdin, r => (result = r));
    });
  }

  private cleanUp() {
    this.process.removeAllListeners();
    this.process.stdout?.removeAllListeners();
    this.process.stderr?.removeAllListeners();
  }

  private handleStdErr(stderr: Readable) {
    // Aggregate stderr messages that are happening shortly after each other
    let aggregatedStdErr = '';
    const debouncedOnStdError = debounce(() => {
      this.onError(aggregatedStdErr);
      aggregatedStdErr = '';
    }, 500);
    stderr.on('data', chunk => {
      aggregatedStdErr += chunk
        .split('\n')
        .map((line: string) => i18n.t(line.trim()))
        .join('\n');
      debouncedOnStdError();
    });
  }

  private handleStdOut(stdout: Readable, stdin: Writable, onResult: (result: string[]) => void) {
    let currentMessage: string[] | undefined = undefined;

    stdout.pipe(split2()).on('data', async (line: string) => {
      line = line.trim();
      const match = line.match(/^--(.*)--$/);
      const isDelimiter = match !== null;
      const delimiter = match ? match[1].trim().toUpperCase() : undefined;

      // Starting delimiter
      if (isDelimiter && !currentMessage) {
        currentMessage = [];
      } else if (isDelimiter && currentMessage) {
        switch (delimiter) {
          case 'PROMPT':
            const request = this.messageToRequest(currentMessage[0]);
            this.respond(stdin, delimiter, [request ? await this.onPrompt(request) : '']);
            break;

          case 'GETOPTION':
            this.respond(stdin, delimiter, [await this.onGetOption(currentMessage[0])]);
            break;

          case 'RESULT':
            onResult(currentMessage);
            break;
        }
        currentMessage = undefined;
      } else if (currentMessage) {
        currentMessage.push(line);
      }
    });
  }

  private messageToRequest(message: string) {
    const parts = message.match(/^(\w+)"(.*)"\("(.*)"\)(?:\[(.*)\])?$/);
    if (parts === null) return undefined;
    return {
      promptType: parts[1] as PromptRequest['promptType'],
      question: parts[2],
      defaultValue: parts[3],
      options:
        parts[4] &&
        Array.from(parts[4].matchAll(/(\w+)"(.*?)"/g)).map(m => ({
          key: m[1],
          value: m[2],
        })),
    } as PromptRequest;
  }

  private respond(stdin: Writable, delimiter: string, message: string[]) {
    stdin.write([`--${delimiter}--`, ...message, `--${delimiter}--`, ''].join('\n'));
  }

  private processMetaResult(result: string[]): BackendMetadata {
    const [status, ...extraLines] = result;
    const supportsLine = extraLines.find(line => line.startsWith('SUPPORTS:'));
    const optionsLine = extraLines.find(line => line.startsWith('OPTIONS:'));
    const supports = supportsLine
      ? supportsLine
          .replace('SUPPORTS:', '')
          .split(' ')
          .map(mime => mime.trim())
          .filter(type => type)
      : undefined;
    const options: BackendOption[] | undefined = optionsLine
      ? Array.from(optionsLine.replace('OPTIONS:', '').matchAll(/(\w+)"(.+?)"\("(.+?)"\)/g)).map(
          match =>
            ({
              id: match[1],
              label: match[2],
              defaultValue: match[3],
            } as BackendOption),
        )
      : undefined;

    return {
      status,
      supports: supports && supports.length > 0 ? supports : undefined,
      options: options && options.length > 0 ? options : undefined,
    };
  }

  private processVerifyResult(result: string[]): SignatureStatus {
    const [status, ...extraLines] = result;
    const details =
      extraLines.length > 0
        ? // Support for translation in verification details
          extraLines.join('\n').replace(/t{(.+?)}/g, (_, text) => i18n.t(text))
        : undefined;

    return {
      status: ['SIGNED', 'UNSIGNED', 'INVALID', 'UNKNOWN'].includes(status)
        ? (status as SignatureStatus['status'])
        : 'UNKNOWN',
      details,
    };
  }
}

export default Communication;
