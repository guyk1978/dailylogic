import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isAppLocale,
  locales,
  LOCALE_COOKIE_KEY,
} from "@/lib/i18n/settings";
import { getLocaleFromPathname } from "@/lib/i18n/paths";

function resolvePreferredLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE_KEY)?.value;
  if (cookie && isAppLocale(cookie)) return cookie;

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of preferred) {
    if (isAppLocale(language)) return language;
    const base = language.split("-")[0];
    if (isAppLocale(base)) return base;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = getLocaleFromPathname(pathname);
  if (pathnameLocale) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE_KEY, pathnameLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const locale = resolvePreferredLocale(request);
  const suffix = pathname === "/" ? "" : pathname;
  request.nextUrl.pathname = `/${locale}${suffix}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};

// Keep locales referenced so tree-shaking retains the list used by middleware.
void locales;
