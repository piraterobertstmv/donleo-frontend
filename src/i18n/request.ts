import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'es', 'it', 'fr', 'de'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

const messageLoaders: Record<Locale, () => Promise<any>> = {
  en: () => import('../../messages/en.json').then(m => m.default),
  es: () => import('../../messages/es.json').then(m => m.default),
  it: () => import('../../messages/it.json').then(m => m.default),
  fr: () => import('../../messages/fr.json').then(m => m.default),
  de: () => import('../../messages/de.json').then(m => m.default)
};

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    const messages = await messageLoaders[defaultLocale]();
    return {locale: defaultLocale, messages};
  }

  const typedLocale = locale as Locale;
  const messages = await messageLoaders[typedLocale]();

  return {locale: typedLocale, messages};
});
