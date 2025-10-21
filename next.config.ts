import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Désactive complètement ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
