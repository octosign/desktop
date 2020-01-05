const execMock = jest.fn();

describe('Backend', () => {
  beforeAll(() => {
    jest.mock('child_process', () => ({
      exec: execMock,
    }));
  });

  afterAll(() => {
    jest.unmock('child_process');
  });

  it('Can be created using a config', () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    expect(backend.getConfig()).toMatchObject({
      name: 'Test',
      exec: './backend',
      dist: './dist',
    });
  });

  it('Should exec sign command on sign', () => {
    const Backend = require('./Backend').default;

    const backend = new Backend(
      {
        name: 'Test',
        exec: './backend',
        dist: './dist',
      },
      '/backends/test',
    );

    backend.sign('some/path.pdf');

    expect(execMock).toHaveBeenCalledWith(
      `./backend sign "some/path.pdf"`,
      expect.objectContaining({ cwd: '/backends/test' }),
      expect.any(Function),
    );
  });
});
