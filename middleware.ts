import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "it", "fr", "de"],
  defaultLocale: "en",
  localePrefix: "always"
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API, Next internals, and static assets (edge-safe)
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const res = intlMiddleware(req);

    // Attach debug header (verify in Vercel response headers)
    res.headers.set("x-i18n-mw", "ok");
    return res;
  } catch (err) {
    // Fail-open: never hard-500 the site again
    console.error("❌ next-intl middleware crashed:", err);
    return NextResponse.next();
  }
}

export const config = {
  // Apply to everything except api, _next, and files with extension
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
