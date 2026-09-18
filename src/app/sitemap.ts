import type { MetadataRoute } from "next";
import { SITE_UPDATED_AT, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const pages = [
  "",
  "/solutions",
  "/work",
  "/approach",
  "/brief",
  "/about",
  "/start",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path, index) => ({
    url: path ? `${SITE_URL}${path}` : `${SITE_URL}/`,
    lastModified: SITE_UPDATED_AT,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
