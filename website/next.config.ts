import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: appDir,
  turbopack: {
    root: appDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/portal",
        destination: "https://shadii-portal.vercel.app",
      },
      {
        source: "/portal/:path*",
        destination: "https://shadii-portal.vercel.app/:path*",
      },
      {
        source: "/assets/:path*",
        destination: "https://shadii-portal.vercel.app/assets/:path*",
      },
      {
        // Support direct favicon rewrite for the portal if loaded under portal path
        source: "/portal/favicon.ico",
        destination: "https://shadii-portal.vercel.app/favicon.ico",
      }
    ];
  },
};

export default nextConfig;
