import { languages } from './i18nSetup';

describe('i18n setup', () => {
  it('Provides a list of languages', () => {
    expect(languages).toBeInstanceOf(Array);
    expect(languages[0]).toStrictEqual({
      code: 'en-US',
      name: 'English',
      translation: {},
    });
  });

  it.todo('Sets up the i18n');
});
