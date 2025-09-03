module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa'],
    localeDetection: true,
  },
  defaultNS: 'common',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
