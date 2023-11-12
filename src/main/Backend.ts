import { dialog } from 'electron';

import BackendConfig from '../shared/BackendConfig';
import Communication from './Communication';
import PromptRequest from '../shared/PromptRequest';
import Exec from './Exec';
import { BackendMetadata, SignatureStatus } from '../shared/BackendResults';

class Backend {
  private readonly config: BackendConfig;
  private readonly path: string;

  constructor(config: BackendConfig, path: string) {
    this.config = {
      version: 'dev',
      ...config,
    };
    this.path = path;
  }

  public getConfig() {
    return this.config;
  }

  public meta() {
    return this.handle(
      'meta',
      msg => console.warn(`Unsupported error during meta operation: "${msg}"`),
      () => Promise.resolve(undefined),
      () => Promise.resolve(''),
    ) as Promise<BackendMetadata | undefined>;
  }

  public sign(
    filePath: string,
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
    onGetOption: (id: string) => Promise<string>,
  ) {
    return this.handle('sign', onError, onPrompt, onGetOption, filePath) as Promise<
      string | undefined
    >;
  }

  public verify(
    filePath: string,
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
    onGetOption: (id: string) => Promise<string>,
  ) {
    return this.handle('verify', onError, onPrompt, onGetOption, filePath) as Promise<
      SignatureStatus | undefined
    >;
  }

  private handle(
    operation: 'meta' | 'sign' | 'verify',
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
    onGetOption: (id: string) => Promise<string>,
    filePath?: string,
  ) {
    return new Communication(
      Exec.run(this.path, this.config.exec, operation, filePath),
      onError,
      request => this.handlePrompt(request, onPrompt),
      id => onGetOption(id),
    ).handle(operation);
  }

  /**
   * Handles by itself if possible and calls callback if not
   */
  private async handlePrompt(
    request: PromptRequest,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
  ): Promise<string> {
    switch (request.promptType) {
      case 'open':
        const { filePaths } = await dialog.showOpenDialog({
          title: request.question,
          defaultPath: request.defaultValue || undefined,
          properties: ['openFile'],
        });
        return filePaths[0] ? filePaths[0] : '';

      case 'save':
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: request.question,
          defaultPath: request.defaultValue || undefined,
        });
        return canceled || !filePath ? '' : filePath;

      default:
        const response = await onPrompt(request);
        return response || '';
    }
  }
}

export default Backend;
