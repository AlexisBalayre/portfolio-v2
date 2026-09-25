/** @type {import('next-sitemap').IConfig} */
const { existsSync } = require("node:fs");
const { join } = require("node:path");

// lib/site.ts and lib/i18n.ts hold the same values; this file is CommonJS and cannot import them.
const siteUrl = "https://alexis.balayre.com";
const locales = ["en", "fr"];
const defaultLocale = "en";

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

// The prerendered paths carry the locale segment (/en, /fr/blog, ...); the public URL drops the
// English prefix, as the rewrites in next.config.js do.
const localePath = (locale, path) => {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

const absoluteUrl = (locale, path) => {
  const localised = localePath(locale, path);
  return localised === "/" ? siteUrl : `${siteUrl}${localised}`;
};

// A post exists in a locale when content/blog/ has its file; en is the source.
const postLocales = slug =>
  locales.filter(
    locale => locale === defaultLocale || existsSync(join(__dirname, "content/blog", `${slug}.${locale}.mdx`)),
  );

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  autoLastmod: true,
  changefreq: "weekly",
  priority: 1.0,
  // Blog pages are prerendered from content/blog/ and picked up automatically; the feeds and the
  // social images are not pages.
  exclude: ["/*/opengraph-image", "/*/blog/opengraph-image", "/*/blog/rss.xml", "/*/blog/*/opengraph-image"],
  transform: async (config, prerenderedPath) => {
    const [, locale, ...rest] = prerenderedPath.split("/");
    if (!locales.includes(locale)) return null;
    const path = rest.length === 0 ? "/" : `/${rest.join("/")}`;
    const slug = path.match(/^\/blog\/([^/]+)$/)?.[1];
    const available = slug ? postLocales(slug) : locales;
    // A French route that falls back to the English post is not a page of its own.
    if (!available.includes(locale)) return null;

    return {
      loc: localePath(locale, path),
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        ...available.map(alternate => ({
          href: absoluteUrl(alternate, path),
          hreflang: alternate,
          hrefIsAbsolute: true,
        })),
        { href: absoluteUrl(defaultLocale, path), hreflang: "x-default", hrefIsAbsolute: true },
      ],
    };
  },
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }, ...aiCrawlers.map(userAgent => ({ userAgent, allow: "/" }))],
    transformRobotsTxt: async (_config, robotsTxt) =>
      `${robotsTxt}\n# AI-agent summary of this site\n# See: ${siteUrl}/llms.txt (English), ${siteUrl}/llms.fr.txt (French)\n`,
  },
};
