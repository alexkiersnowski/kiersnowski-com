import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/cv", destination: "/cv/index.html" }];
  },
};

export default nextConfig;
