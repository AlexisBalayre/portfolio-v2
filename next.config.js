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

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
