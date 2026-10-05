import { readFileSync } from "node:fs";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/`, hosted on Cloudflare like the current site.
  output: "export",
  // The image optimiser needs a server; static exports serve images as-is.
  images: { unoptimized: true },
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "mdx"],
};

// Brand code theme; every token colour clears WCAG AA on the code background.
const shikiTheme = JSON.parse(readFileSync("./src/lib/mdx/shiki-prodbuilds.json", "utf8"));

// Turbopack needs plugins as strings with JSON-serialisable options.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [["@shikijs/rehype", { theme: shikiTheme }]],
  },
});

export default withMDX(nextConfig);
