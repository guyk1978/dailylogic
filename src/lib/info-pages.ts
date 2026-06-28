export const INFO_PAGES = {
  about: { path: "/about" },
  privacy: { path: "/privacy" },
  terms: { path: "/terms" },
  contact: { path: "/contact" },
  security: { path: "/security" },
} as const;

export type InfoPageKey = keyof typeof INFO_PAGES;

export const INFO_PAGE_KEYS = Object.keys(INFO_PAGES) as InfoPageKey[];

export const INFO_PAGE_PATHS = Object.values(INFO_PAGES).map((page) => page.path);
