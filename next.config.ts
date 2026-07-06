import type { NextConfig } from "next";

// Trigger production rebuild: rollback to original light theme website design
const nextConfig: NextConfig = {
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
