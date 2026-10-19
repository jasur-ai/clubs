import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost:3000"],
  images: { remotePatterns: [] },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
