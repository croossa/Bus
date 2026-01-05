import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  reactCompiler: true,
  cacheComponents: true,

  /* =========================
     WWW → NON-WWW REDIRECT
     ========================= */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.croossa.com",
          },
        ],
        destination: "https://croossa.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
