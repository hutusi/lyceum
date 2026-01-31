import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for automatic optimization
  reactCompiler: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Optimize images for production
    formats: ["image/avif", "image/webp"],
  },

  // Compression is handled by Vercel/hosting provider
  compress: true,

  // Generate source maps for production debugging (optional)
  productionBrowserSourceMaps: false,

  // Strict mode for better React practices
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },

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
        ],
      },
    ];
  },
};

export default nextConfig;
