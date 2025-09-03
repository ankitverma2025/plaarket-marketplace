# Internationalization (i18n) Setup

This project now supports multiple Indian regional languages using Next.js built-in i18n support.

## Supported Languages

- **English (en)** - Default language
- **Hindi (hi)** - हिंदी
- **Bengali (bn)** - বাংলা
- **Tamil (ta)** - தமிழ்
- **Telugu (te)** - తెలుగు
- **Marathi (mr)** - मराठी
- **Gujarati (gu)** - ગુજરાતી
- **Kannada (kn)** - ಕನ್ನಡ
- **Malayalam (ml)** - മലയാളം
- **Punjabi (pa)** - ਪੰਜਾਬੀ

## How It Works

### 1. Configuration

- **Next.js Config**: i18n is configured in `next.config.js`
- **Translation Files**: Located in `public/locales/{language}/common.json`
- **Language Detection**: Automatically detects user's preferred language

### 2. Usage in Components

```tsx
import { useTranslation } from "@/utils/translations";

export default function MyComponent() {
  const { t, locale, changeLanguage } = useTranslation();

  return (
    <div>
      <h1>{t("home.hero.title")}</h1>
      <p>{t("home.hero.subtitle")}</p>

      {/* Language switcher */}
      <button onClick={() => changeLanguage("hi")}>Switch to Hindi</button>
    </div>
  );
}
```

### 3. Translation Keys

Translation keys use dot notation:

- `nav.home` → "Home" / "होम" / "হোম"
- `home.hero.title` → "Your Trusted Organic Products Marketplace" / "आपका विश्वसनीय जैविक उत्पाद बाजार"

### 4. Adding New Languages

1. **Create translation file**:

   ```bash
   mkdir -p public/locales/{language_code}
   touch public/locales/{language_code}/common.json
   ```

2. **Add language to config**:

   ```js
   // next.config.js
   i18n: {
     locales: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'new_lang'],
     // ...
   }
   ```

3. **Add to LanguageSwitcher**:
   ```tsx
   // src/components/LanguageSwitcher.tsx
   const languages = [
     // ... existing languages
     { code: "new_lang", name: "Language Name", flag: "🏳️" },
   ];
   ```

### 5. URL Structure

With i18n enabled, your URLs will include language codes:

- `/en/products` - English products page
- `/hi/products` - Hindi products page
- `/bn/products` - Bengali products page

### 6. Language Detection

The system automatically:

- Detects user's browser language preference
- Redirects to appropriate language version
- Falls back to English if language not supported

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Provide fallbacks** for missing translations
3. **Keep translation keys organized** and descriptive
4. **Test all languages** before deployment
5. **Consider RTL languages** if adding Arabic/Urdu later

## Adding More Content

To add translations for new content:

1. **Add to English file first** (`public/locales/en/common.json`)
2. **Translate to all supported languages**
3. **Use in components** with `t('key.path')`

## Example Translation Structure

```json
{
  "section": {
    "subsection": {
      "key": "English text"
    }
  }
}
```

## Troubleshooting

- **Language not switching**: Check `next.config.js` i18n configuration
- **Missing translations**: Ensure all language files have the same structure
- **Build errors**: Verify JSON syntax in translation files
- **URL issues**: Check that locales array includes all supported languages
