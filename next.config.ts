import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components sengaja dimatikan (ADR-006 di docs/ARCHITECTURE.md).
  cacheComponents: false,
  // Mengaktifkan forbidden() dan unauthorized() beserta halaman 403/401.
  experimental: { authInterrupts: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
