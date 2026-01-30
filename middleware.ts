import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

let intlMiddleware: ((req: NextRequest) => Response) | null = null;

function getIntlMiddleware() {
  if (!intlMiddleware) {
    intlMiddleware = createMiddleware({
      locales: ["en", "es", "it", "fr", "de"],
      defaultLocale: "en"
    });
  }
  return intlMiddleware;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, API, and static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    return getIntlMiddleware()(req);
  } catch (err) {
    // FAIL OPEN so we never get a white 500 screen again
    console.error("❌ next-intl middleware crashed:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
