import type { MetadataRoute } from "next";
import { publicWebsitePaths, siteOrigin } from "@/lib/site-settings";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicWebsitePaths.map(path => ({ url: `${siteOrigin()}${path === "/" ? "" : path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : path === "/contact" || path === "/admissions" ? 0.8 : 0.6 }));
}
