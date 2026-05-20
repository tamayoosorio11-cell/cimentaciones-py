import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for desktop build (set NEXT_EXPORT=1 in desktop GitHub Action)
  output: process.env.NEXT_EXPORT === "1" ? "export" : undefined,
  // Disable image optimization for static export
  images: { unoptimized: true },
};

export default nextConfig;
