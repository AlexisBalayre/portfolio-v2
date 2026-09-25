/** @type {import('next-sitemap').IConfig} */
const siteUrl = "https://alexis.balayre.com";

// Answer engines and AI assistants that honour robots.txt. "*" already allows them; listing them
// makes the intent explicit for operators that look for a dedicated rule.
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

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  autoLastmod: true,
  changefreq: "weekly",
  priority: 1.0,
  // Blog pages are prerendered from content/blog/ and picked up automatically; the feed and the
  // social images are not pages.
  exclude: ["/opengraph-image", "/blog/opengraph-image", "/blog/rss.xml", "/blog/*/opengraph-image"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }, ...aiCrawlers.map(userAgent => ({ userAgent, allow: "/" }))],
    transformRobotsTxt: async (_config, robotsTxt) =>
      `${robotsTxt}\n# AI-agent summary of this site\n# See: ${siteUrl}/llms.txt\n`,
  },
};
