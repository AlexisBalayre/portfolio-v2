// lib/site.ts
// The site-wide constants shared by the root layout, the blog routes and the RSS feed.
// next-sitemap.config.js repeats siteUrl because it is CommonJS and cannot import this file.
export const siteUrl = "https://alexis.balayre.com";
export const siteName = "Alexis Balayre | AI Engineer";
export const authorName = "Alexis Balayre";
export const twitterHandle = "@alexisbalayre";

export const blogUrl = `${siteUrl}/blog`;
export const blogTitle = "Blog";
export const blogDescription =
  "Technical articles by Alexis Balayre on his open-source projects (Pupitre, agentspine, Claude Code config, AI Daily Summary) and on engineering practices for building with AI agents.";
export const feedUrl = `${blogUrl}/rss.xml`;
