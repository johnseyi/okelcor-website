import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "300mb",
    },
  },
  images: {
    remotePatterns: [
      {
        // Local Laravel dev server — allow all paths (storage, media, etc.)
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        // Production API server — allow all paths served by Laravel
        protocol: "https",
        hostname: "api.okelcor.de",
      },
      {
        // Pinterest CDN — used by static article fallback images in data.ts
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
