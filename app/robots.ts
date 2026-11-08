import type { MetadataRoute } from "next";
import { OWNER } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${OWNER.siteUrl}/sitemap.xml`,
  };
}
