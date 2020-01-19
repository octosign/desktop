import { remote } from 'electron';

import BackendConfig from '../shared/BackendConfig';
import Communication from './Communication';
import PromptRequest from '../shared/PromptRequest';
import Exec from './Exec';

class Backend {
  private readonly config: BackendConfig;
  private readonly path: string;

  constructor(config: BackendConfig, path: string) {
    this.config = { version: 'dev', ...config };
    this.path = path;
  }

  public getConfig() {
    return this.config;
  }

  public meta(
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
  ) {
    return this.handle('meta', onError, onPrompt);
  }

  public sign(
    filePath: string,
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
  ) {
    return this.handle('sign', onError, onPrompt, filePath);
  }

  public verify(
    filePath: string,
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
  ) {
    return this.handle('verify', onError, onPrompt, filePath);
  }

  private handle(
    operation: string,
    onError: (message: string) => void,
    onPrompt: (request: PromptRequest) => Promise<string | undefined>,
    filePath?: string,
  ) {
    return new Communication(
      Exec.run(this.path, this.config.exec, operation, filePath),
      onError,
      request => this.handlePrompt(request, onPrompt),
      id => this.handleGetOption(id),
    ).handle();
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
        const { filePaths } = await remote.dialog.showOpenDialog({
          title: request.question,
          defaultPath: request.defaultValue || undefined,
          properties: ['openFile'],
        });
        return filePaths[0] ? filePaths[0] : '';

      case 'save':
        const { canceled, filePath } = await remote.dialog.showSaveDialog({
          title: request.question,
          defaultPath: request.defaultValue || undefined,
        });
        return canceled || !filePath ? '' : filePath;

      default:
        const response = await onPrompt(request);
        return response || '';
    }
  }

  /**
   * Handles all requests by retrieving saved option
   */
  private async handleGetOption(id: string) {
    // TODO: Add retrieving of options from settings

    return id;
  }
}

export default Backend;
