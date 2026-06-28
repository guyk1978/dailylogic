import { defaultLocale, locales, type AppLocale } from "@/lib/i18n/settings";

/** Strip a leading locale segment from a pathname (e.g. `/he/blog` → `/blog`). */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      const rest = pathname.slice(locale.length + 1);
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return pathname;
}

/** Prefix an app path with the locale segment (e.g. `/blog` + `he` → `/he/blog`). */
export function localizedPath(path: string, locale: AppLocale): string {
  const [pathname, search = ""] = path.split("?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const base =
    normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
  return search ? `${base}?${search}` : base;
}

/** Replace the locale segment in the current pathname. */
export function switchLocalePath(pathname: string, locale: AppLocale): string {
  return localizedPath(stripLocalePrefix(pathname), locale);
}

/** Read locale from the first URL segment, if valid. */
export function getLocaleFromPathname(pathname: string): AppLocale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment && (locales as readonly string[]).includes(segment)) {
    return segment as AppLocale;
  }
  return null;
}

export function getPathnameLocaleOrDefault(pathname: string): AppLocale {
  return getLocaleFromPathname(pathname) ?? defaultLocale;
}
