import { useTranslation as useNextI18nTranslation } from 'next-i18next';

export function useTranslation() {
  const { t, i18n } = useNextI18nTranslation('common');
  
  return {
    t,
    locale: i18n.language,
    locales: ['en', 'hi', 'bn', 'ta', 'te'],
    defaultLocale: 'en',
    changeLanguage: i18n.changeLanguage,
  };
}
