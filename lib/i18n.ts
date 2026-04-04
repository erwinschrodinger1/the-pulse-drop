import * as i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '@/locales/en.json';
import np from '@/locales/np.json';

const resources = {
  en: { translation: en },
  np: { translation: np },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const normalizedLanguage = deviceLanguage === 'ne' ? 'np' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: normalizedLanguage,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
