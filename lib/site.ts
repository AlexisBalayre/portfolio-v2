// lib/site.ts
// The site-wide constants shared by the root layout, the blog routes and the RSS feed.
// next-sitemap.config.js repeats siteUrl and the locale prefix rule because it is CommonJS and cannot import this file.
import { defaultLocale, getDictionary, localePath, locales, type Locale } from "~~/lib/i18n";

export const siteUrl = "https://alexis.balayre.com";
export const siteName = "Alexis Balayre | AI Engineer";
export const authorName = "Alexis Balayre";
export const twitterHandle = "@alexisbalayre";

// Absolute URL of a page in a locale: the English home is siteUrl itself, without a trailing slash.
export const localeUrl = (locale: Locale, path = "/"): string => {
  const localised = localePath(locale, path);
  return localised === "/" ? siteUrl : `${siteUrl}${localised}`;
};

export const blogUrl = (locale: Locale): string => localeUrl(locale, "/blog");
export const postUrl = (locale: Locale, slug: string): string => localeUrl(locale, `/blog/${slug}`);
export const feedUrl = (locale: Locale): string => localeUrl(locale, "/blog/rss.xml");
export const feedTitle = (locale: Locale): string => `${getDictionary(locale).blog.title} | ${authorName}`;

// hreflang alternates of a page, restricted to the locales it exists in; x-default is the English page.
export const languageAlternates = (path: string, available: readonly Locale[] = locales): Record<string, string> =>
  Object.fromEntries([
    ...available.map(locale => [locale, localeUrl(locale, path)]),
    ["x-default", localeUrl(defaultLocale, path)],
  ]);
