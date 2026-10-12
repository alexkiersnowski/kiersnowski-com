import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only assets are blocked cross-origin, so previewing on a phone over the LAN
  // needs this machine's address listed.
  allowedDevOrigins: ["192.168.1.37"],

  images: {
    // AVIF first (all current browsers), WebP fallback. 90 keeps UI-screenshot text crisp;
    // Next 16 requires every quality used by <Image> to be allowlisted here.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },

  // The CV is a standalone static page in public/cv (it prints to the PDF beside it).
  async rewrites() {
    return [{ source: "/cv", destination: "/cv/index.html" }];
  },
};

export default nextConfig;
