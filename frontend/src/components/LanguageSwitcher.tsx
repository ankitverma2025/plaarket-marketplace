import { useRouter } from 'next/router';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = router.locale || 'en';

  const handleLanguageChange = (locale: string) => {
    // Use replace to avoid adding to browser history
    router.replace(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="flex items-center space-x-1 bg-white rounded-md border border-gray-200 p-1 shadow-sm">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
            currentLocale === language.code
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={`Switch to ${language.name}`}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
}
