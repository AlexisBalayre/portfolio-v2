// app/sitemap.ts
import type { MetadataRoute } from "next";
import { defaultLocale, locales, type Locale } from "~~/lib/i18n";
import { getAllPosts } from "~~/lib/posts";
import { languageAlternates, localeUrl, portfolioUpdatedOn } from "~~/lib/site";

// Written at build time from the same loaders as the pages, so the sitemap cannot lag behind the content the
// way the committed next-sitemap output did. Every lastmod is a content date, never the build date.
// See docs/adr/0003-sitemap-and-robots-as-next-metadata-routes.md.
const page = (locale: Locale, path: string, lastModified: string, available: readonly Locale[] = locales) => ({
  url: localeUrl(locale, path),
  lastModified,
  alternates: { languages: languageAlternates(path, available) },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Newest first; YYYY-MM-DD strings compare as dates.
  const posts = await getAllPosts(defaultLocale);
  const newestPost = posts[0]?.date;
  const blogLastModified = newestPost ?? portfolioUpdatedOn;
  const homeLastModified = newestPost && newestPost > portfolioUpdatedOn ? newestPost : portfolioUpdatedOn;

  return [
    ...locales.map(locale => page(locale, "/", homeLastModified)),
    ...locales.map(locale => page(locale, "/blog", blogLastModified)),
    // A French route that falls back to the English body is not a page of its own: only real translations are listed.
    ...posts.flatMap(post => post.locales.map(locale => page(locale, `/blog/${post.slug}`, post.date, post.locales))),
  ];
}
