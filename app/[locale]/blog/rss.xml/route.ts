// app/[locale]/blog/rss.xml/route.ts
import { getDictionary, languageTags, locales, toLocale } from "~~/lib/i18n";
import { getAllPosts } from "~~/lib/posts";
import { blogUrl, feedTitle, feedUrl } from "~~/lib/site";

// Rendered once per locale at build time from content/blog/, like the pages.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

const XML_ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

const escapeXml = (text: string): string => text.replace(/[&<>"']/g, character => XML_ENTITIES[character]);

const rfc822 = (date: string): string => new Date(date).toUTCString();

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);
  // An untranslated post is listed, but under its English URL: the French route is only a fallback.
  const posts = await getAllPosts(locale);
  const lastBuildDate = rfc822(posts[0]?.date ?? new Date().toISOString());

  const items = posts
    .map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${post.canonicalUrl}</link>
      <guid isPermaLink="true">${post.canonicalUrl}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
${post.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle(locale))}</title>
    <link>${blogUrl(locale)}</link>
    <description>${escapeXml(t.blog.description)}</description>
    <language>${languageTags[locale].toLowerCase()}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl(locale)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
