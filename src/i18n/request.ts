import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "es", "it", "fr", "de"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

// Static import map to avoid runtime/bundler issues in Vercel
const messagesMap: Record<Locale, () => Promise<any>> = {
  en: () => import("../../messages/en.json"),
  es: () => import("../../messages/es.json"),
  it: () => import("../../messages/it.json"),
  fr: () => import("../../messages/fr.json"),
  de: () => import("../../messages/de.json")
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined;

  if (!locale || !locales.includes(locale)) locale = defaultLocale;

  const messages = (await messagesMap[locale]()).default;

  return { locale, messages };
});
