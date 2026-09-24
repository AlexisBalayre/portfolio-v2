// app/blog/rss.xml/route.ts
import { getAllPosts } from "~~/lib/posts";
import { blogDescription, blogUrl, feedTitle, feedUrl } from "~~/lib/site";

// Rendered once at build time from content/blog/, like the pages.
export const dynamic = "force-static";

const XML_ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

const escapeXml = (text: string): string => text.replace(/[&<>"']/g, character => XML_ENTITIES[character]);

const rfc822 = (date: string): string => new Date(date).toUTCString();

export async function GET() {
  const posts = await getAllPosts();
  const lastBuildDate = rfc822(posts[0]?.date ?? new Date().toISOString());

  const items = posts
    .map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
${post.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(blogDescription)}</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
