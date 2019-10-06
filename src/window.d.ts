declare module 'preload' {
  global {
    interface OctoSign {
      sign(filePath: string): void;
    }

    interface Window {
      OctoSign: OctoSign;
    }
  }
}
