import parseAuthor from './parseAuthor';

describe('Parse Author', () => {
  it('Returns undefined for broken author string', async () => {
    const result = parseAuthor('Jakub <jakub@');

    expect(result).toBe(undefined);
  });

  it('Parses correctly just name', async () => {
    const result = parseAuthor('Jakub');

    expect(result).toStrictEqual({
      name: 'Jakub',
      email: undefined,
      web: undefined,
    });
  });

  it('Parses correctly name and email', async () => {
    const result = parseAuthor('Jakub <jakub@duras.me>');

    expect(result).toStrictEqual({
      name: 'Jakub',
      email: 'jakub@duras.me',
      web: undefined,
    });
  });

  it('Parses correctly name and email and web', async () => {
    const result = parseAuthor('Jakub <jakub@duras.me> (duras.me)');

    expect(result).toStrictEqual({
      name: 'Jakub',
      email: 'jakub@duras.me',
      web: 'duras.me',
    });
  });

  it('Parses correctly name and web', async () => {
    const result = parseAuthor('Jakub (duras.me)');

    expect(result).toStrictEqual({
      name: 'Jakub',
      email: undefined,
      web: 'duras.me',
    });
  });

  it('Parses correctly name, web, email without spaces', async () => {
    const result = parseAuthor('Jakub<jakub@duras.me>(duras.me)');

    expect(result).toStrictEqual({
      name: 'Jakub',
      email: 'jakub@duras.me',
      web: 'duras.me',
    });
  });

  it('Parses correctly email and web only', async () => {
    const result = parseAuthor('<jakub@duras.me>(duras.me)');

    expect(result).toStrictEqual({
      name: undefined,
      email: 'jakub@duras.me',
      web: 'duras.me',
    });
  });
});
