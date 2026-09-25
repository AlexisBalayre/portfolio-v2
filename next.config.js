// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Pin the tracing root so a checkout nested under .worktrees/ does not pick up the parent's lockfile
  outputFileTracingRoot: __dirname,

  // Toggle ignoring build/lint errors via env if you need it
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },

  // Image remote patterns (kept)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "repository-images.githubusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "user-images.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "balayre.com" },
      { protocol: "https", hostname: "alexis.balayre.com" },
    ],
  },

  // English is the default locale and lives unprefixed: every English path is served by the /en route
  // tree without a redirect, a cookie or a middleware. French keeps its /fr prefix.
  // See docs/adr/0002-bilingual-routes-under-a-locale-segment-with-rewrites.md.
  // The /en/** twins are the rewrite targets only: a direct hit goes back to the unprefixed URL.
  // Redirects run before rewrites and are not re-applied to a rewrite destination.
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },

  async rewrites() {
    return [
      { source: "/", destination: "/en" },
      { source: "/opengraph-image", destination: "/en/opengraph-image" },
      { source: "/blog", destination: "/en/blog" },
      { source: "/blog/:path*", destination: "/en/blog/:path*" },
    ];
  },

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
