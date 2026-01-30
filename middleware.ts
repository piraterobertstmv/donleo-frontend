import { NextRequest, NextResponse } from "next/server";

let _intlMiddleware: ((req: NextRequest) => Response) | null = null;

function getIntlMiddleware() {
  if (_intlMiddleware) return _intlMiddleware;

  // Lazy import so any edge/runtime issues happen inside try/catch
  const createMiddleware = require("next-intl/middleware").default as any;

  _intlMiddleware = createMiddleware({
    locales: ["en", "es", "it", "fr", "de"],
    defaultLocale: "en"
  });

  return _intlMiddleware!;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, API, and static files
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
    // Temporary debug log (keep minimal)
    console.log("✅ middleware hit:", pathname);

    const intlMiddleware = getIntlMiddleware();
    return intlMiddleware(req);
  } catch (err) {
    console.error("❌ middleware crashed:", err);
    return NextResponse.next(); // fail-open (no more white 500 screen)
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
