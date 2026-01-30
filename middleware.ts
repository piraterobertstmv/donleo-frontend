import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'it', 'fr', 'de'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(en|es|it|fr|de)/:path*']
};
