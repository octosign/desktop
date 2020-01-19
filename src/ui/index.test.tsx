/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { SFCElement } from 'react';
import ReactDOMServer from 'react-dom/server';

describe('UI Index', () => {
  it('Renders App and assigns showWindow to be called after that', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const renderMock = jest.fn((element, container?, callback?) =>
        ReactDOMServer.renderToString(element),
      );
      jest.mock('react-dom', () => ({
        render: (element: SFCElement<unknown>, container?: Element, callback?: () => void) =>
          renderMock(element, container, callback),
        findDOMNode: () => undefined,
      }));
      jest.mock('./components/App', () => () => 'App component content');
      window.showWindow = jest.fn();

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
    // @ts-ignore
    window.OctoSign = undefined;

    require('./index');

    expect(window.OctoSign).toBeDefined();

    process.env.NODE_ENV = nodeEnv;
    // @ts-ignore
    window.OctoSign = undefined;
  });
});
