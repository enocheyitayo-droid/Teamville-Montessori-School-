import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-settings";

// Block the whole private portal and API by prefix, so new private pages are covered
// automatically and robots.txt no longer lists every private route. The public
// school photos under /school/*.png (used for link previews) stay crawlable.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/school/*.png"], disallow: ["/school$", "/school/", "/school?", "/api/"] }, sitemap: `${siteOrigin()}/sitemap.xml` };
}
