import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { placeholderFields } from "./config/site";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default function config(phase: string) {
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.__PLACEHOLDER_WARNED) {
    process.env.__PLACEHOLDER_WARNED = "1";
    const p = placeholderFields();
    if (p.length) {
      console.warn(`\n\x1b[33m⚠ config/site.ts still has placeholder values: ${p.join(", ")}. Replace them before launch.\x1b[0m\n`);
    }
  }
  return nextConfig;
}
