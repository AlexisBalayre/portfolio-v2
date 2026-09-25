// app/robots.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "~~/lib/site";

// Answer engines and AI assistants that honour robots.txt. "*" already allows them; the explicit group makes
// the intent visible to operators that look for a dedicated rule.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "meta-externalagent",
  "Amazonbot",
  "CCBot",
];

// The social images and the feeds stay crawlable here; the X-Robots-Tag header in next.config.js keeps them
// out of the index without hiding them from the pages that link to them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
