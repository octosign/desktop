declare module 'preload' {
  import PromptRequest from './shared/PromptRequest';
  import BackendState from './shared/BackendState';
  import { SignatureStatus } from './shared/BackendResults';

  global {
    interface OctoSign {
      list(): Promise<BackendState[]>;
      set(slug: string): Promise<void>;
      sign(
        filePath: string,
        onError: (message: string) => void,
        onPrompt: (request: PromptRequest) => Promise<string | undefined>,
      ): Promise<string | undefined>;
      verify(
        filePath: string,
        onError: (message: string) => void,
        onPrompt: (request: PromptRequest) => Promise<string | undefined>,
      ): Promise<SignatureStatus | undefined>;
      getOptionValues(): { [backendSlug: string]: { [key: string]: string } };
      setOptionValues(values: OptionValues): void;
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
      /**
       * Returns a File object represeting file with the given absolute path
       */
      pathToFile: (path: string) => Promise<File>;
      /**
       * Get application version
       */
      getVersion: () => string;
    }
  }
}
