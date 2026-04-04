import * as i18n from 'i18next';

export type AppLanguage = 'en' | 'np';

export const setLanguage = (lang: AppLanguage) => {
  i18n.changeLanguage(lang);
};

export const getLanguage = (): AppLanguage => {
  return (i18n.default.language === 'np' ? 'np' : 'en') as AppLanguage;
};
