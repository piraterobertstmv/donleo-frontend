import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "it", "fr", "de"],
  defaultLocale: "en"
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, API, and all static files (prevents edge crashes on assets)
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

  // Temporary debug log
  console.log("✅ middleware hit:", pathname);

  try {
    return intlMiddleware(req);
  } catch (err) {
    // Fail OPEN so the site never hard-500s again
    console.error("❌ middleware crashed:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
