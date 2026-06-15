/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://alexis.balayre.com",
  generateRobotsTxt: true,
  autoLastmod: true,
  changefreq: "weekly",
  priority: 1.0,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
