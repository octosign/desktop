import { FunctionComponentElement } from 'react';
import ReactDOMServer from 'react-dom/server';
import { vi } from 'vitest';

describe('UI Index', () => {
  it('Renders App and assigns showWindow to be called after that', () => {
    vi.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const renderMock = vi.fn((element, container?, callback?) =>
        ReactDOMServer.renderToString(element),
      );
      vi.mock('react-dom', () => ({
        render: (element: FunctionComponentElement<unknown>, container?: Element, callback?: () => void) =>
          renderMock(element, container, callback),
        findDOMNode: () => undefined,
      }));
      vi.mock('./components/App', () => () => 'App component content');
      window.showWindow = vi.fn();

      require('./index');

      expect(renderMock).toHaveBeenCalled();
      const rendered = renderMock.mock.results[0].value;
      expect(rendered).toMatch(/App component content/);

      renderMock.mock.calls[0][2]();

      expect(window.showWindow).toHaveBeenCalled();

      delete window.showWindow;
    });
  });

  it('Mocks window API if in dev env and is not available', () => {
    const nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    // @ts-expect-error We are removing property that has to be there
    window.OctoSign = undefined;

    require('./index');

    expect(window.OctoSign).toBeDefined();

    process.env.NODE_ENV = nodeEnv;
    // @ts-expect-error We are removing property that has to be there
    window.OctoSign = undefined;
  });
});
