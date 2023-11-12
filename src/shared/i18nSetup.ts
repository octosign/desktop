import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sk from '../translations/sk_SK.json';
import cz from '../translations/cs_CZ.json';

export const languages = [
  {
    code: 'en-US',
    name: 'English',
    translation: {} as { [key: string]: string },
  },
  {
    code: 'sk-SK',
    name: 'Slovenčina',
    translation: sk,
  },
  {
    code: 'cs-CZ',
    name: 'Česky',
    translation: cz,
  },
];

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: languages.reduce((acc, lang) => {
      acc[lang.code] = { translation: lang.translation };
      return acc;
    }, {} as { [code: string]: { translation: { [key: string]: string } } }),
    fallbackLng: 'en-US',
    nsSeparator: false,
    keySeparator: false,
    detection: { caches: ['localStorage'], order: ['localStorage', 'navigator'] },
    supportedLngs: languages.map(lang => lang.code),
  });

export default i18n;
