import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/`, hosted on Cloudflare like the current site.
  output: "export",
  // The image optimiser needs a server; static exports serve images as-is.
  images: { unoptimized: true },
  reactCompiler: true,
};

export default nextConfig;
