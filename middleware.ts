import createMiddleware from 'next-intl/middleware';
import {NextResponse} from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'it', 'fr', 'de'],
  defaultLocale: 'en'
});

export default function middleware(req: Request) {
  try {
    return intlMiddleware(req);
  } catch (err) {
    console.error('❌ next-intl middleware crashed:', err);
    return NextResponse.next();
  }
}

export const config = {
  // Exclude Next internals, API routes, and any file with an extension
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
