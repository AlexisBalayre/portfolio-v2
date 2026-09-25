// lib/i18n.ts
// The locales, the URL prefix rule and the UI dictionary. Client-safe: no fs, no next/navigation.
// See docs/adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md.
import en from "~~/public/assets/data/en/ui.json";
import fr from "~~/public/assets/data/fr/ui.json";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// English is unprefixed (/, /blog, ...); next.config.js rewrites those paths to /en/**.
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

// Route params are plain strings; dynamicParams = false keeps unknown locales out, this narrows the type.
export const toLocale = (value: string): Locale => {
  if (!isLocale(value)) throw new Error(`Unknown locale "${value}"`);
  return value;
};

// BCP 47 tags for html lang, Intl, JSON-LD inLanguage and the RSS <language>; Open Graph wants underscores.
export const languageTags: Record<Locale, string> = { en: "en-GB", fr: "fr-FR" };
export const ogLocales: Record<Locale, string> = { en: "en_GB", fr: "fr_FR" };

// "/blog" -> "/blog" for en, "/fr/blog" for fr; "/" -> "/" or "/fr".
export const localePath = (locale: Locale, path = "/"): string => {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

// "/en/blog" and "/fr/blog" -> "/blog"; "/en" -> "/". The prerendered English pages see the /en
// pathname on the server and the unprefixed one in the browser, so the header compares this form.
export const stripLocale = (pathname: string): string => {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname;
  return rest.length === 0 ? "/" : `/${rest.join("/")}`;
};

export type Dictionary = typeof en;

// A key missing from fr/ui.json fails typecheck here: the French dictionary must have the English shape.
const dictionaries: Record<Locale, Dictionary> = { en, fr };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

// "Posts about {name}" -> "Posts about Pupitre". Unknown placeholders are left as written.
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, key) => (key in values ? String(values[key]) : placeholder));
