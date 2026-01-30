import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'it', 'fr', 'de'],
  defaultLocale: 'en'
});

export default function middleware(req: NextRequest) {
  try {
    return intlMiddleware(req);
  } catch (err) {
    console.error('❌ next-intl middleware crashed:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
