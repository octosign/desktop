declare module 'preload' {
  import BackendConfig from './shared/BackendConfig';
  import PromptRequest from './shared/PromptRequest';
  import BackendState from './shared/BackendState';

  global {
    interface OctoSign {
      list(): Promise<BackendState[]>;
      set(slug: string): Promise<void>;
      meta(
        onError: (message: string) => void,
        onPrompt: (request: PromptRequest) => Promise<string | undefined>,
      ): Promise<unknown>;
      sign(
        filePath: string,
        onError: (message: string) => void,
        onPrompt: (request: PromptRequest) => Promise<string | undefined>,
      ): Promise<unknown>;
      verify(
        filePath: string,
        onError: (message: string) => void,
        onPrompt: (request: PromptRequest) => Promise<string | undefined>,
      ): Promise<unknown>;
    }

    interface Window {
      /**
       * Resolved when OctoSign API is ready
       */
      apiReady: Promise<void>;
      OctoSign: OctoSign;

      /**
       * Show main electorn window
       */
      showWindow: () => void;
      /**
       * Create tmp file for base64-encoded image and return its path
       */
      createTmpImage: (data: string) => Promise<string>;
    }
  }
}
