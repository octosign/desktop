// TODO: Remove once the module ships with types
// https://github.com/agilgur5/react-signature-canvas/issues/21
declare module 'react-signature-canvas' {
  // signature_pad's props
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  export interface IOptions {
    dotSize?: number | (() => number);
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    backgroundColor?: string;
    penColor?: string;
    throttle?: number;
    velocityFilterWeight?: number;
    onBegin?: (event: MouseEvent | Touch) => void;
    onEnd?: (event: MouseEvent | Touch) => void;
  }

  // props specific to the React wrapper
  export interface SignatureCanvasProps extends IOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvasProps?: any;
    clearOnResize?: boolean;
    ref?: (api: SignatureCanvasAPI) => void;
  }

  export interface SignatureCanvasAPI {
    clear: () => void;
    toDataURL(mimetype: string, encoderOptions?: number);
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {}
}
