import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where the browser supports it (smaller than WebP), WebP otherwise.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
