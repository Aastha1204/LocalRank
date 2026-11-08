import type { MetadataRoute } from "next";
import { OWNER } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: OWNER.siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${OWNER.siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
