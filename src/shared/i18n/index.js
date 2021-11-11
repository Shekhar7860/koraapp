import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import resources from './locales';

const options = {
  debug: false,

  lng: 'en',

  resources,

  fallbackLng: 'en',

  react: {
    wait: false,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default',
  },
};
i18n.use(LanguageDetector).use(initReactI18next).init(options);

export default i18n;
