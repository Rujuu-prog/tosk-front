import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // CSP Header
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline for dev
              "style-src 'self' 'unsafe-inline'", // Mantine requires unsafe-inline for styles
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:8080 ws://localhost:3001", // Allow API calls to backend and hot reload
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "x-forwarded-proto",
              value: "http",
            },
          ],
          destination: "https://localhost/:path*",
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
