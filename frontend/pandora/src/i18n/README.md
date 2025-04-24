# Internationalization (i18n) Setup

This directory contains the internationalization setup for the application.

## Requirements
The following packages are required for internationalization:
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Auto-detects user language

## Structure
- `i18n.js` - Main configuration file that sets up i18next
- `locales/` - Directory containing translation files
  - `en.json` - English translations
  - `es.json` - Spanish translations

## Usage
Import the Translation components in your React components:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

## Language Switching
Use the LanguageSwitcher component to change languages:

```jsx
import LanguageSwitcher from '@/components/ui/language-switcher';

function MyHeader() {
  return (
    <div className="header">
      <LanguageSwitcher />
    </div>
  );
}
```

## Date and Currency Formatting
Use the appropriate format functions for locale-aware formatting:

```jsx
// Date formatting
{t('dateFormat', { date: myDate })}

// Currency formatting
{t('dashboard.currencyFormat', { value: amount })}
```

## Adding New Translations
1. Add new keys to both `en.json` and `es.json`
2. Follow the existing nested structure
3. Use descriptive keys organized by feature/component

## Important Notes
- Always use the '@/' alias for imports to avoid path resolution issues
- The i18n setup is imported in main.jsx and available throughout the application
- User language preference is stored in localStorage