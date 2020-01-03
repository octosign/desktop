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

  it('Should exec sign command on sign', () => {
    const Backend = require('./Backend').default;

    const backend = new Backend();

    backend.sign('some/path.pdf');

    expect(execMock).toHaveBeenCalledWith(
      expect.stringContaining('some/path.pdf'),
      expect.anything(),
      expect.anything(),
    );
  });
});
